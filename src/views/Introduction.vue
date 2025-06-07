<template>
    <div class="container mx-auto">
        <section class="p-6">
            <h1 class="text-4xl font-bold mb-4">{{ langStore.i18nR("s1_h1") }}</h1>
            <p class="text-lg text-gray-700 mb-5">{{ langStore.i18nR("s1_p1") }}</p>
            <router-link to="/section1">
                <button class="bg-lime-500 text-white text-lg p-2 rounded cursor-pointer mb-10">{{ langStore.i18nR("s1_b1") }}</button>
            </router-link>

            <!-- Render Scorm component here -->
            <Scorm />
        </section>
    </div>
</template>

<script setup lang="ts">
import { useLangStore } from "@/stores/uesLang";
import Scorm from "@/components/debug/Scorm/Scorm.vue";

const langStore = useLangStore();
</script>
