import { defineStore } from "pinia";
import { scormAPI } from "@/lib/scormApi";

export const useScormStore = defineStore("scorm", {
    state: () => ({
        API: scormAPI,
        version: "",
        location: 0,
        scormAPIConnected: false,
        scormConnectRun: 0,
        scormInited: { success: false, version: "" } as { success: boolean; version: string },
        suspendData: "",
    }),
    actions: {
        scormConnect() {
            if (this.scormAPIConnected) {
                console.log("---SCORM already connected---", this);
                return;
            }
            console.log("---SCORM connect---", this);
            this.API.configure({ version: "1.2", debug: true });
            const result = this.API.initialize();
            this.scormInited = result;
            this.scormConnectRun++;
            this.scormAPIConnected = result.success;
            this.version = result.version;
            console.warn("SCORM VERSION", this.version);
        },

        scormlogNotConnected() {
            console.warn("SCORM not connected");
        },

        scormGetLocation(): number {
            let loc = "0";
            if (this.scormAPIConnected) {
                loc = this.version === "1.2" ? this.API.get("cmi.core.lesson_location") : this.API.get("cmi.location");
            } else {
                loc = sessionStorage.getItem("bookmark") ?? "0";
            }
            return parseInt(loc);
        },

        scormGetSuspendData(): object | false {
            let suspendData = "";
            if (this.scormAPIConnected) {
                suspendData = this.API.get("cmi.suspend_data");
            } else {
                suspendData = sessionStorage.getItem("suspend_data") ?? "{}";
            }
            suspendData = suspendData.replace(/[~]/g, '"').replace(/[|]/g, ",").replace(/[¬]/g, "'");
            if (!suspendData) return false;
            try {
                return JSON.parse(suspendData);
            } catch (e) {
                console.error(e);
                return false;
            }
        },

        scormSetSuspendData(data: object) {
            this.reconnectAttemptIfNeeded();
            let jsonData = JSON.stringify(data).replace(/[']/g, "¬").replace(/["]+/g, "~").replace(/[,]/g, "|");

            if (this.scormAPIConnected) {
                if (this.version === "1.2" && jsonData.length > 4096) {
                    throw new Error("Suspend Data length cannot exceed 4096 on SCORM 1.2");
                }
                this.API.set("cmi.suspend_data", jsonData);
            } else {
                sessionStorage.setItem("suspend_data", jsonData);
            }

            sessionStorage.setItem("suspend_data_str", jsonData);
            sessionStorage.setItem("suspend_data", JSON.stringify(data));
            this.suspendData = jsonData;
            this.API.commit();
        },

        scormGetStudentName(): string {
            if (!this.scormAPIConnected) return "John Doe";
            return this.version === "1.2" ? this.API.get("cmi.core.student_name") : this.API.get("cmi.learner_name");
        },

        scormGetStudentID(): string {
            if (!this.scormAPIConnected) return "john.doe@company.com";
            return this.version === "1.2" ? this.API.get("cmi.core.student_id") : this.API.get("cmi.learner_id");
        },

        scormSetComplete() {
            this.reconnectAttemptIfNeeded();
            if (this.scormAPIConnected) {
                if (this.version === "1.2") {
                    this.API.set("cmi.core.lesson_status", "completed");
                } else {
                    this.API.set("cmi.completion_status", "completed");
                }
            } else {
                this.scormlogNotConnected();
            }
        },

        scormSetLocation(location: number, suspendData: object | null = null) {
            this.reconnectAttemptIfNeeded();
            if (this.scormAPIConnected) {
                if (this.version === "1.2") {
                    this.API.set("cmi.core.lesson_location", location.toString());
                } else {
                    this.API.set("cmi.location", location.toString());
                }
            } else {
                sessionStorage.setItem("bookmark", location.toString());
            }
            this.location = location;
            if (suspendData) this.scormSetSuspendData(suspendData);
            sessionStorage.setItem("bookmark_location", location.toString());
            this.API.commit();
        },

        scormSetScore(score: number) {
            this.reconnectAttemptIfNeeded();
            if (this.scormAPIConnected) {
                if (this.version === "1.2") {
                    this.API.set("cmi.core.score.min", "0");
                    this.API.set("cmi.core.score.max", "100");
                    this.API.set("cmi.core.score.raw", score.toString());
                } else {
                    this.API.set("cmi.score.min", "0");
                    this.API.set("cmi.score.max", "100");
                    this.API.set("cmi.score.raw", score.toString());
                }
            }
        },

        reconnectAttemptIfNeeded() {
            if (!this.scormConnectRun) {
                console.log("SCORM not connected, reconnecting...");
                this.scormConnect();
            }
        },

        scormTerminate() {
            this.reconnectAttemptIfNeeded();
            if (this.scormAPIConnected) {
                this.API.terminate();
            } else {
                this.scormlogNotConnected();
            }
        },
    },
});
