<script setup lang="ts">
import { onMounted } from "vue";
import { useScormStore } from "@/stores/useScorm";

const scorm = useScormStore();

onMounted(() => {
    // Connect to SCORM when the component mounts
    scorm.scormConnect();
});
</script>

<template>
    <router-view />
</template>

<style scoped></style>
