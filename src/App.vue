<script setup lang="ts">
import { onMounted } from "vue";
import { useScormStore } from "@/stores/useScorm";

const scorm = useScormStore();

onMounted(() => {
    // Connect to SCORM when the component mounts
    scorm.scormConnect();

    // Example: get current location from SCORM or sessionStorage
    const currentLocation = scorm.scormGetLocation();
    console.log("Current SCORM location:", currentLocation);

    // Example: set a new location
    // scorm.scormSetLocation(currentLocation + 1);

    // Example: set completion
    // scorm.scormSetComplete();

    // Example: set a score
    // scorm.scormSetScore(85);
});
</script>

<template>
    <router-view />
</template>

<style scoped></style>
