import WelcomeView from "@/views/WelcomeView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/welcome",
            name: "welcome",
            component: WelcomeView,
        },
        {
            path: "/about",
            name: "about",
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/AboutView.vue"),
        },
        {
            path: "/newconversation",
            name: "newconversation",
            component: () => import("../views/NewConversationView.vue"),
        },
        {
            path: "/register",
            name: "register",
            component: () => import("../views/RegisterView.vue"),
        },
        {
            path: "/chat",
            name: "chat",
            component: () => import("../views/ChatView.vue"),
        },
    ],
});

export default router;
