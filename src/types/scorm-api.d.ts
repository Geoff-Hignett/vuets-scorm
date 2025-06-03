declare module "@/lib/scormApi" {
    export const scormAPI: {
        configure: (config: { version: string; debug?: boolean }) => void;
        initialize: () => { success: boolean; version: string };
        get: (key: string) => string;
        set: (key: string, value: string) => void;
        commit: () => void;
        terminate: () => void;
    };
}
