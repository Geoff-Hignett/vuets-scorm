import { defineStore } from "pinia";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const langCodes = [EN.language, FR.language, ES.language];

export const useLangStore = defineStore("lang", () => {
    const activeLangIndex = ref(0);
    const activeLang = computed(() => langCodes[activeLangIndex.value]);

    const setActiveLang = (index: number) => {
        if (index in langCodes) {
            activeLangIndex.value = index;
        }
    };

    const findPageByPath = (path: string) => {
        return activeLang.value.routes.find((page) => page.url === path);
    };

    const i18nR = (key: string): string => {
        const route = useRoute();
        const currentPath = route.path;
        const page = findPageByPath(currentPath);
        if (!page) return key;

        const field = page.fields.find((f: any) => f.key === key);

        return field ? field.Text : "TEXT NOT FOUND";
    };

    return {
        activeLangIndex,
        activeLang,
        setActiveLang,
        i18nR,
    };
});
