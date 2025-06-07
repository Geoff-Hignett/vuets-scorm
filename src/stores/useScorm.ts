import { defineStore } from "pinia";
import { scormAPI } from "@/lib/scormApi";

interface ScormInteraction {
    interactionID: string;
    questionRef: string;
    questionText: string;
    questionType: string;
    questionOptions?: { option: string; key: string }[];
    learnerResponse: string;
    correctAnswer: string;
    wasCorrect: boolean | null;
    objectiveId: string;
}

export const useScormStore = defineStore("scorm", {
    state: () => ({
        API: scormAPI,
        version: "",
        location: 0,
        scormAPIConnected: false,
        scormConnectRun: 0,
        scormInited: { success: false, version: "" } as { success: boolean; version: string },
        suspendData: "",
        interactions: [
            {
                interactionID: "1",
                questionRef: "q1",
                questionText: "What is 2 + 2?",
                questionType: "numeric",
                learnerResponse: "",
                correctAnswer: "4",
                wasCorrect: null,
                objectiveId: "obj1",
            },
            {
                interactionID: "2",
                questionRef: "q2",
                questionText: "Pick a fruit",
                questionType: "choice",
                questionOptions: [
                    { option: "Apple", key: "1" },
                    { option: "Banana", key: "2" },
                    { option: "Orange", key: "3" },
                ],
                learnerResponse: "",
                correctAnswer: "Banana",
                wasCorrect: null,
                objectiveId: "obj2",
            },
        ] as ScormInteraction[],
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

            const currentStatus = this.version === "1.2" ? this.API.get("cmi.core.lesson_status") : this.API.get("cmi.completion_status");

            if (!["completed", "passed"].includes(currentStatus?.toLowerCase())) {
                console.log("mark course incomplete");
                if (this.version === "1.2") {
                    this.API.set("cmi.core.lesson_status", "incomplete");
                } else {
                    this.API.set("cmi.completion_status", "incomplete");
                }
            }
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
            console.log(loc);
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

        scormGetScore(): number | null {
            if (!this.scormAPIConnected) {
                console.warn("SCORM not connected — cannot get score");
                return null;
            }

            let scoreStr = "";
            if (this.version === "1.2") {
                scoreStr = this.API.get("cmi.core.score.raw");
            } else {
                scoreStr = this.API.get("cmi.score.raw");
            }

            if (!scoreStr) {
                console.warn("No score found in SCORM data");
                return null;
            }

            const score = Number(scoreStr);
            if (isNaN(score)) {
                console.warn("SCORM score is not a number:", scoreStr);
                return null;
            }

            return score;
        },

        scormGetStudentName() {
            if (!this.scormAPIConnected) {
                console.log("attempting getStudentName but scorm not connected");
            } else {
                let name;
                if (this.version === "1.2") {
                    name = this.API.get("cmi.core.student_name");
                } else {
                    name = this.API.get("cmi.learner_name");
                }
                console.log("Student Name:", name);
                return name;
            }
        },

        scormGetStudentID() {
            if (!this.scormAPIConnected) {
                console.log("attempting getStudentName but scorm not connected");
            } else {
                let id;
                if (this.version === "1.2") {
                    id = this.API.get("cmi.core.student_id");
                } else {
                    id = this.API.get("cmi.learner_id");
                }
                console.log("Student ID:", id);
                return id;
            }
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
            console.log("setting score: " + score);
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

        scormInitObjectives() {
            this.reconnectAttemptIfNeeded();
            if (this.scormAPIConnected) {
                // For SCORM 1.2 and 2004 the syntax is similar here:
                // Set the first objective's ID — this "registers" the objective slot
                this.API.set("cmi.objectives.0.id", "objective_1");
                this.API.commit();
                console.log("SCORM objectives initialized");
            } else {
                console.warn("SCORM not connected, cannot initialize objectives");
            }
        },

        scormSetObjectiveScore(index: number, score: number) {
            this.reconnectAttemptIfNeeded();
            if (this.scormAPIConnected) {
                const basePath = `cmi.objectives.${index}.score.raw`;
                this.API.set(basePath, score.toString());
                this.API.commit();
                console.log(`SCORM objective ${index} score set to ${score}`);
            } else {
                console.warn("SCORM not connected, cannot set objective score");
            }
        },

        scormSetObjectiveProgress(index: number, progress: number) {
            this.reconnectAttemptIfNeeded();
            if (this.scormAPIConnected) {
                const basePath = `cmi.objectives.${index}.progress_measure`;
                // progress_measure expects a float between 0 and 1
                const value = (progress / 100).toFixed(2);
                this.API.set(basePath, value);
                this.API.commit();
                console.log(`SCORM objective ${index} progress set to ${value}`);
            } else {
                console.warn("SCORM not connected, cannot set objective progress");
            }
        },

        setInteraction({ interaction, learnerResponse }: { interaction: number; learnerResponse: string }) {
            if (!this.interactions[interaction]) return;

            const current = this.interactions[interaction];
            current.learnerResponse = learnerResponse;
            current.wasCorrect = learnerResponse === current.correctAnswer;
        },

        recordScormQuestion(
            questionRef: string,
            // questionText: string,
            questionType: string,
            learnerResponse: string,
            correctAnswer: string,
            wasCorrect: boolean | null,
            objectiveId: string,
            interactionID: string
        ) {
            if (!this.scormAPIConnected) {
                console.warn("SCORM not connected — skipping interaction log");
                return;
            }

            const base = this.version === "1.2" ? "cmi.interactions" : "cmi.interactions";

            const index = interactionID; // In real SCORM, you'd track how many interactions have been set so far

            this.API.set(`${base}.${index}.id`, questionRef);
            this.API.set(`${base}.${index}.type`, questionType);
            this.API.set(`${base}.${index}.learner_response`, learnerResponse);
            this.API.set(`${base}.${index}.correct_responses.0.pattern`, correctAnswer);
            this.API.set(`${base}.${index}.result`, wasCorrect ? "correct" : "incorrect");
            this.API.set(`${base}.${index}.objectives.0.id`, objectiveId);

            this.API.commit();
            console.log(`Interaction ${index} sent to LMS`);
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
