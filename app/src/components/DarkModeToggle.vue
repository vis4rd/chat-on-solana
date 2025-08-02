<script setup lang="ts">
    import { Button } from "@/components/ui/button";
    import { Icon } from "@iconify/vue";
    import { useColorMode } from "@vueuse/core";
    import { ref } from "vue";

    const mode = useColorMode();
    const isDark = ref(false);

    function toggleTheme() {
        isDark.value = !isDark.value;
        mode.value = isDark.value ? "dark" : "light";
    }
</script>

<template>
    <Button variant="outline" size="icon" aria-label="Toggle darkmode" @click="toggleTheme()">
        <Icon v-if="mode === 'dark'" icon="fluent:weather-moon-24-regular" class="size-5" />
        <Icon v-else icon="fluent:weather-sunny-24-regular" class="size-5" />
    </Button>
</template>
