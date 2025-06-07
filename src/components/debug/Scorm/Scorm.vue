<template>
    <div class="container mx-auto">
        <div class="flex items-center mb-4">
            <h2 class="font-bold text-xl mr-5">SCORM Test</h2>
            <h2 class="">
                Project currently set to
                <span class="font-bold text-red-600">SCORM {{ scormStore.version }}</span>
            </h2>
        </div>

        <div class="flex mb-5 flex-wrap gap-2">
            <button @click="scormStore.scormGetLocation" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Get Location</button>
            <button @click="scormStore.scormGetScore" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Get Score</button>
            <button @click="scormStore.scormGetStudentName" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Get Student Name</button>
            <button @click="scormStore.scormGetStudentID" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Get Student ID</button>
            <button @click="scormStore.scormGetSuspendData" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Get Suspend Data</button>
        </div>

        <div class="flex mb-5 flex-wrap gap-2">
            <button @click="() => scormStore.scormSetLocation(1)" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">
                Set Location 1
            </button>
            <button @click="() => scormStore.scormSetScore(50)" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Set Score 50</button>
            <button @click="scormStore.scormSetComplete" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Set Complete</button>
            <button @click="scormStore.scormTerminate" class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer">Quit</button>
        </div>

        <div class="flex items-center mb-4 gap-2">
            <h2 class="font-bold text-xl mr-5">SCORM Objectives</h2>
        </div>
        <div class="flex items-center mb-4 gap-2">
            <button class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer" @click="scormStore.scormInitObjectives">Init Objectives</button>
            <button class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer" @click="scormStore.scormSetObjectiveScore(0, 50)">
                Set Objective 1 Score 50
            </button>
            <button class="bg-sky-500 text-white text-lg p-2 rounded cursor-pointer" @click="scormStore.scormSetObjectiveProgress(0, 0.5)">
                Set Objective 1 Progress 50%
            </button>
        </div>
        <Interactions />
    </div>
</template>

<script setup lang="ts">
import { useScormStore } from "@/stores/useScorm";
import Interactions from "./Interactions.vue";
const scormStore = useScormStore();
</script>
