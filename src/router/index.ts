import { createRouter, createWebHashHistory } from "vue-router";
import Introduction from "@/views/Introduction.vue";
import Section1 from "@/views/Section1.vue";
import Summary from "@/views/Summary.vue";

const routes = [
    { path: "/", component: Introduction },
    { path: "/section1", component: Section1 },
    { path: "/summary", component: Summary },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
