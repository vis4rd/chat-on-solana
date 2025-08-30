<script setup lang="ts">
    import { cn } from "@/lib/utils";
    import { reactiveOmit, useScroll } from "@vueuse/core";
    import type { ScrollAreaRootProps } from "reka-ui";
    import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from "reka-ui";
    import ScrollBar from "./ScrollBar.vue";
    import { onMounted, ref, toRef, type HTMLAttributes } from "vue";

    const props = defineProps<ScrollAreaRootProps & { keepBottom?: boolean; class?: HTMLAttributes["class"] }>();
    const delegatedProps = reactiveOmit(props, "class");
    const scrollAreaRootRef = ref<{ viewport: HTMLElement } | null>(null);
    const { y, arrivedState } = useScroll(() => scrollAreaRootRef.value?.viewport);
    const { y: smoothY } = useScroll(() => scrollAreaRootRef.value?.viewport, { behavior: "smooth" });
    const bottom = toRef(arrivedState, "bottom");

    const isBottom = () => bottom.value;
    const scrollToBottom = (behavior: string = "auto") => {
        if (scrollAreaRootRef.value) {
            if (behavior === "smooth") {
                smoothY.value = scrollAreaRootRef.value?.viewport.scrollHeight;
            } else {
                y.value = scrollAreaRootRef.value?.viewport.scrollHeight;
            }
        }
    };

    onMounted(() => {
        if (props.keepBottom && scrollAreaRootRef.value) {
            y.value = scrollAreaRootRef.value.viewport.scrollHeight;
        }
    });

    interface Expose {
        isBottom: () => boolean;
        scrollToBottom: (behavior?: string) => void;
    }

    defineExpose<Expose>({ isBottom, scrollToBottom });
</script>

<template>
    <ScrollAreaRoot
        v-bind="delegatedProps"
        :class="cn('relative overflow-hidden', props.class)"
        ref="scrollAreaRootRef"
    >
        <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
            <slot />
        </ScrollAreaViewport>
        <ScrollBar />
        <ScrollAreaCorner />
    </ScrollAreaRoot>
</template>
