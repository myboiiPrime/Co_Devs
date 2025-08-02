<template>
  <div class="code-editor">
    <div class="editor-toolbar">
      <select v-model="selectedLanguage" @change="changeLanguage" class="language-selector">
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="json">JSON</option>
      </select>
      <div class="editor-actions">
        <button @click="formatCode" class="btn-action">
          <span class="icon">🎨</span> Format
        </button>
        <!-- Quick AI actions only show when text is selected -->
        <div v-if="hasSelection" class="ai-quick-actions">
          <span class="selection-info">{{ selectionInfo }}</span>
          <button @click="askAiAboutSelection('explain')" class="btn-action ai-btn">
            💡 Ask AI
          </button>
        </div>
      </div>
    </div>
    <div class="editor-container" ref="editorContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import loader from '@monaco-editor/loader'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  documentId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'cursor-change', 'selection-change', 'ai-request'])

const editorContainer = ref(null)
const selectedLanguage = ref(props.language)
const hasSelection = ref(false)
const selectedText = ref('')
const selectionRange = ref(null)

let editor = null
let monaco = null

const selectionInfo = computed(() => {
  if (!hasSelection.value) return ''
  const lines = selectedText.value.split('\n').length
  const chars = selectedText.value.length
  return `${lines} line${lines !== 1 ? 's' : ''}, ${chars} chars`
})

onMounted(() => {
  initializeEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue || '')
  }
})

watch(() => props.language, (newLanguage) => {
  selectedLanguage.value = newLanguage
  if (editor && monaco) {
    monaco.editor.setModelLanguage(editor.getModel(), newLanguage)
  }
})

const initializeEditor = async () => {
  if (!editorContainer.value) return

  try {
    // Load Monaco Editor
    monaco = await loader.init()
    
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue || '',
      language: selectedLanguage.value,
      theme: 'vs-dark',
      readOnly: props.readOnly,
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      selectOnLineNumbers: true,
      matchBrackets: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true
    })

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue()
      emit('update:modelValue', value)
      emit('change', value)
    })

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      emit('cursor-change', {
        lineNumber: e.position.lineNumber,
        column: e.position.column
      })
    })

    // Listen for selection changes
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getSelection()
      const selectedContent = editor.getModel().getValueInRange(selection)
      hasSelection.value = selectedContent.length > 0
      selectedText.value = selectedContent
      selectionRange.value = selection
      
      emit('selection-change', {
        hasSelection: hasSelection.value,
        selectedText: selectedContent,
        range: selection
      })
    })

    // Setup context menu
    setupContextMenu()
  } catch (error) {
    console.error('Failed to initialize Monaco Editor:', error)
  }
}

const setupContextMenu = () => {
  // Add custom context menu actions
  editor.addAction({
    id: 'ai-explain',
    label: '💡 Ask AI to Explain',
    contextMenuGroupId: 'ai-tools',
    contextMenuOrder: 1,
    run: () => askAiAboutSelection('explain')
  })

  editor.addAction({
    id: 'ai-optimize',
    label: '⚡ Ask AI to Optimize',
    contextMenuGroupId: 'ai-tools', 
    contextMenuOrder: 2,
    run: () => askAiAboutSelection('optimize')
  })

  editor.addAction({
    id: 'ai-generate',
    label: '🤖 Ask AI to Generate',
    contextMenuGroupId: 'ai-tools',
    contextMenuOrder: 3,
    run: () => askAiAboutSelection('generate')
  })
}

const changeLanguage = () => {
  if (editor && monaco) {
    monaco.editor.setModelLanguage(editor.getModel(), selectedLanguage.value)
  }
}

const formatCode = () => {
  if (editor) {
    editor.getAction('editor.action.formatDocument').run()
  }
}

const askAiAboutSelection = (action) => {
  // This will be handled by the parent component
  // For context menu actions, we want to add code to chat like "Add Code" button
  emit('ai-request', {
    action: 'add-code', // Always use 'add-code' action for context menu
    selectedText: selectedText.value,
    hasSelection: hasSelection.value,
    language: selectedLanguage.value,
    contextAction: action // Keep track of the original action for prompt customization
  })
}

const insertCode = (code) => {
  if (editor) {
    const selection = editor.getSelection()
    editor.executeEdits('ai-insert', [{
      range: selection,
      text: code
    }])
    editor.focus()
  }
}

const insertAtCursor = (code) => {
  if (editor) {
    const position = editor.getPosition()
    editor.executeEdits('ai-insert-cursor', [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: code
    }])
    editor.focus()
  }
}

const replaceSelection = (code) => {
  if (editor && hasSelection.value) {
    const selection = editor.getSelection()
    editor.executeEdits('ai-replace', [{
      range: selection,
      text: code
    }])
    editor.focus()
  }
}

// Expose methods for parent components
defineExpose({
  getEditor: () => editor,
  setValue: (value) => editor?.setValue(value || ''),
  getValue: () => editor?.getValue() || '',
  focus: () => editor?.focus(),
  insertCode,
  insertAtCursor,
  replaceSelection,
  getSelectedText: () => selectedText.value,
  hasSelection: () => hasSelection.value
})
</script>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #1e1e1e;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
  width: 100%;
}

.language-selector {
  padding: 4px 8px;
  border: 1px solid #3e3e3e;
  border-radius: 4px;
  background-color: #3c3c3c;
  color: #cccccc;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  border-left: 1px solid #ccc;
}

.selection-info {
  font-size: 11px;
  color: #666;
  font-style: italic;
}

.btn-action {
  padding: 4px 12px;
  border: 1px solid #007acc;
  background-color: #007acc;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-action:hover {
  background-color: #005a9e;
}

.ai-btn {
  background-color: #28a745;
  border-color: #28a745;
}

.ai-btn:hover {
  background-color: #218838;
}

.icon {
  font-size: 12px;
}

.editor-container {
  flex: 1;
  width: 100%;
}
</style>