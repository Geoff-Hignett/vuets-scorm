<template>
    <div class="container mx-auto">
        <h2 class="font-bold text-xl mb-2">SCORM Interactions</h2>
        <div class="flex gap-2">
            <div class="mb-3">
                <label for="numeric" class="block text-lg">{{ scormInteractions[0].questionText }} (numeric)</label>
                <input v-model="numericAnswer" id="numeric" type="number" class="appearance-none border border-gray-950 rounded py-2 px-3" />
                <button
                    :disabled="!numericAnswered"
                    @click="submitNumeric"
                    class="bg-sky-500 text-white text-lg p-2 rounded ml-3"
                    :class="{ 'opacity-20': !numericAnswered, 'cursor-pointer': numericAnswered }">
                    Submit Interaction 1 (to store)
                </button>
            </div>

            <div class="mb-3">
                <label for="choice" class="block text-lg">{{ scormInteractions[1].questionText }} (choice)</label>
                <select v-model="choiceAnswer" id="choice" class="border border-gray-950 rounded py-2 px-3 text-lg cursor-pointer">
                    <option value="">Choose Answer</option>
                    <option v-for="option in scormInteractions[1].questionOptions" :key="option.key" :value="option.option">
                        {{ option.option }}
                    </option>
                </select>
                <button
                    :disabled="!choiceAnswered"
                    @click="submitChoice"
                    class="bg-sky-500 text-white text-lg p-2 rounded ml-3"
                    :class="{ 'opacity-20': !choiceAnswered, 'cursor-pointer': choiceAnswered }">
                    Submit Interaction 2 (to store)
                </button>
            </div>
        </div>

        <div class="flex">
            <button @click="logInteractionsToLMS" class="bg-sky-500 text-white text-lg p-2 rounded mr-3 cursor-pointer">
                Log Interactions To LMS
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useScormStore } from "@/stores/useScorm";

const scormStore = useScormStore();

const numericAnswer = ref("");
const choiceAnswer = ref("");

const numericAnswered = computed(() => numericAnswer.value !== "");
const choiceAnswered = computed(() => choiceAnswer.value !== "");

const scormInteractions = computed(() => scormStore.interactions);

const submitNumeric = () => {
    scormStore.setInteraction({
        interaction: 0,
        learnerResponse: numericAnswer.value.toString(),
    });
};

const submitChoice = () => {
    const selectedOption = scormInteractions.value[1]?.questionOptions?.find((option) => option.option === choiceAnswer.value);

    const responseKey = selectedOption?.key ?? "";

    scormStore.setInteraction({
        interaction: 1,
        learnerResponse: responseKey,
    });
};

const logInteractionsToLMS = () => {
    console.log("Attempting logInteractionsToLMS");
    scormInteractions.value.forEach((item) => {
        console.log(`scormInteraction item: ${JSON.stringify(item)}`);
        scormStore.recordScormQuestion(
            item.questionRef,
            item.questionType,
            item.learnerResponse,
            item.correctAnswer,
            item.wasCorrect,
            item.objectiveId,
            item.interactionID
        );
    });
};
</script>

<style scoped></style>
