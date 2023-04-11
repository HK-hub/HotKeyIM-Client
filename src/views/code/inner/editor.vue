<script setup>
import { ref, shallowRef } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import {html} from '@codemirror/lang-html'
import { oneDark } from '@codemirror/theme-one-dark'

const code = ref('')
const extensions = [java(), html(),javascript(), oneDark]

// Codemirror EditorView instance ref
const view = shallowRef()
const handleReady = (payload) => {
    view.value = payload.view
}

// Status is available at all times via Codemirror EditorView
const getCodemirrorStates = () => {
    const state = view.value.state
    const ranges = state.selection.ranges
    const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
    const cursor = ranges[0].anchor
    const length = state.doc.length
    const lines = state.doc.lines
    // more state info ...
    // return ...
}

const onChange = (evt) => {
    console.log('change', evt)
}
const onFocus = (evt) => {
    console.log('change', evt)
}
const onBlur = (evt) => {
    console.log('change', evt)
}

</script>

<template>
    <Codemirror
        v-model="code"
        placeholder="Code goes here..."
        :style="{ height: '100%' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="4"
        :extensions="extensions"
        @ready="handleReady"
        @change="onChange($event)"
        @focus="onFocus($event)"
        @blur="onBlur($event)"
    />
</template>

<style lang="less" scoped>

</style>


