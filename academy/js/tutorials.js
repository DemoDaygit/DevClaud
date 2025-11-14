/**
 * TutorialSystem - Interactive Code Editor and Exercise System
 * Uses Monaco Editor for syntax highlighting and code execution
 */

export class TutorialSystem {
    constructor(curriculum) {
        this.curriculum = curriculum;
        this.editor = null;
        this.currentExercise = null;
        this.userCode = new Map(); // Store user's code for each exercise

        // Monaco configuration
        this.monacoConfig = {
            theme: 'vs-dark',
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on'
        };

        // Supported languages
        this.languages = {
            'python': 'python',
            'javascript': 'javascript',
            'typescript': 'typescript',
            'rust': 'rust',
            'go': 'go'
        };
    }

    async init() {
        await this.loadMonaco();
        this.setupEditor();
        this.setupEventListeners();
        this.loadExercises();
    }

    async loadMonaco() {
        return new Promise((resolve, reject) => {
            if (window.monaco) {
                resolve();
                return;
            }

            require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

            require(['vs/editor/editor.main'], () => {
                // Configure Monaco theme
                monaco.editor.defineTheme('academy-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'comment', foreground: '6A9955' },
                        { token: 'keyword', foreground: '569CD6' },
                        { token: 'string', foreground: 'CE9178' },
                        { token: 'number', foreground: 'B5CEA8' },
                    ],
                    colors: {
                        'editor.background': '#1e293b',
                        'editor.foreground': '#f8fafc',
                        'editor.lineHighlightBackground': '#334155',
                        'editorCursor.foreground': '#667eea',
                        'editor.selectionBackground': '#475569',
                    }
                });

                resolve();
            });
        });
    }

    setupEditor() {
        const editorContainer = document.getElementById('code-editor');
        if (!editorContainer) return;

        this.editor = monaco.editor.create(editorContainer, {
            value: '# Select an exercise to begin',
            language: 'python',
            theme: 'academy-dark',
            ...this.monacoConfig
        });

        // Add custom commands
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            this.runCode();
        });
    }

    setupEventListeners() {
        // Run button
        const runBtn = document.getElementById('run-code');
        if (runBtn) {
            runBtn.addEventListener('click', () => this.runCode());
        }

        // Reset button
        const resetBtn = document.getElementById('reset-code');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCode());
        }

        // Clear output button
        const clearBtn = document.getElementById('clear-output');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearOutput());
        }
    }

    loadExercises() {
        const exerciseList = document.getElementById('exercise-list');
        if (!exerciseList) return;

        exerciseList.innerHTML = '';

        this.curriculum.exercises.forEach((exercise, index) => {
            const item = document.createElement('div');
            item.className = 'exercise-item';
            item.innerHTML = `
                <div class="exercise-number">${index + 1}</div>
                <div class="exercise-info">
                    <h4>${exercise.title}</h4>
                    <p>${exercise.description || 'Practice exercise'}</p>
                    <div class="exercise-meta">
                        <span class="difficulty ${exercise.difficulty}">${exercise.difficulty || 'medium'}</span>
                        <span class="language">${exercise.language || 'Python'}</span>
                    </div>
                </div>
            `;

            item.addEventListener('click', () => this.loadExercise(exercise));
            exerciseList.appendChild(item);
        });
    }

    loadExercise(exercise) {
        this.currentExercise = exercise;

        // Update title
        const titleEl = document.getElementById('exercise-title');
        if (titleEl) {
            titleEl.textContent = exercise.title;
        }

        // Set language
        const language = this.languages[exercise.language?.toLowerCase()] || 'python';
        monaco.editor.setModelLanguage(this.editor.getModel(), language);

        // Load saved code or starter code
        const savedCode = this.userCode.get(exercise.id);
        const code = savedCode || exercise.starterCode || exercise.code || '';
        this.editor.setValue(code);

        // Display exercise description
        this.displayExerciseInfo(exercise);

        // Clear previous output
        this.clearOutput();

        // Update UI
        document.querySelectorAll('.exercise-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.closest('.exercise-item')?.classList.add('active');
    }

    displayExerciseInfo(exercise) {
        const panel = document.getElementById('explanation-panel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="explanation-content">
                <h3>📝 Exercise Description</h3>
                <p>${exercise.description || 'Complete the code challenge below.'}</p>

                ${exercise.objectives ? `
                    <h4>🎯 Objectives</h4>
                    <ul>
                        ${exercise.objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                ` : ''}

                ${exercise.hints ? `
                    <h4>💡 Hints</h4>
                    <div class="hints">
                        ${exercise.hints.map((hint, i) => `
                            <details class="hint-item">
                                <summary>Hint ${i + 1}</summary>
                                <p>${hint}</p>
                            </details>
                        `).join('')}
                    </div>
                ` : ''}

                ${exercise.expectedOutput ? `
                    <h4>✅ Expected Output</h4>
                    <pre><code>${exercise.expectedOutput}</code></pre>
                ` : ''}

                ${exercise.testCases ? `
                    <h4>🧪 Test Cases</h4>
                    <div class="test-cases">
                        ${exercise.testCases.map(test => `
                            <div class="test-case">
                                <strong>Input:</strong> <code>${test.input}</code><br>
                                <strong>Expected:</strong> <code>${test.expected}</code>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="actions">
                    <button class="btn btn-secondary" onclick="window.tutorialSystem.showSolution()">
                        👁️ Show Solution
                    </button>
                    <button class="btn btn-secondary" onclick="window.tutorialSystem.runTests()">
                        🧪 Run Tests
                    </button>
                </div>
            </div>
        `;
    }

    async runCode() {
        if (!this.currentExercise) {
            this.output('⚠️ Please select an exercise first', 'warning');
            return;
        }

        const code = this.editor.getValue();
        this.userCode.set(this.currentExercise.id, code);

        this.output('▶️ Running code...', 'info');

        try {
            const language = this.currentExercise.language?.toLowerCase() || 'python';

            switch (language) {
                case 'javascript':
                case 'typescript':
                    await this.runJavaScript(code);
                    break;
                case 'python':
                    await this.runPython(code);
                    break;
                default:
                    this.output(`⚠️ Language "${language}" execution not yet supported in browser.\nYou can copy this code and run it in your local environment.`, 'warning');
            }
        } catch (error) {
            this.output(`❌ Error: ${error.message}`, 'error');
        }
    }

    async runJavaScript(code) {
        // Capture console output
        const originalLog = console.log;
        const originalError = console.error;
        const outputs = [];

        console.log = (...args) => {
            outputs.push(args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
        };

        console.error = (...args) => {
            outputs.push('ERROR: ' + args.join(' '));
        };

        try {
            // Create isolated scope
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const fn = new AsyncFunction(code);
            await fn();

            // Restore console
            console.log = originalLog;
            console.error = originalError;

            if (outputs.length === 0) {
                this.output('✅ Code executed successfully (no output)', 'success');
            } else {
                this.output('✅ Output:\n' + outputs.join('\n'), 'success');
            }
        } catch (error) {
            console.log = originalLog;
            console.error = originalError;
            throw error;
        }
    }

    async runPython(code) {
        // For Python, we'll simulate execution or use Pyodide
        if (window.pyodide) {
            try {
                const result = await window.pyodide.runPythonAsync(code);
                this.output('✅ Output:\n' + (result || 'Code executed successfully'), 'success');
            } catch (error) {
                this.output(`❌ Python Error:\n${error.message}`, 'error');
            }
        } else {
            // Fallback: show message about Python execution
            this.output(`ℹ️ Python code cannot be executed directly in the browser.

Here's your code:
${code}

To run this code:
1. Copy the code above
2. Save it to a .py file
3. Run with: python your_file.py

Or use an online Python interpreter like repl.it`, 'info');
        }
    }

    runTests() {
        if (!this.currentExercise || !this.currentExercise.testCases) {
            this.output('⚠️ No test cases available for this exercise', 'warning');
            return;
        }

        this.output('🧪 Running tests...', 'info');

        const code = this.editor.getValue();
        let passed = 0;
        let failed = 0;

        this.currentExercise.testCases.forEach((test, index) => {
            try {
                // This is a simplified test runner
                // In production, you'd want proper sandboxing
                const result = eval(`(${code})(${test.input})`);

                if (result === test.expected) {
                    passed++;
                    this.output(`✅ Test ${index + 1} passed`, 'success');
                } else {
                    failed++;
                    this.output(`❌ Test ${index + 1} failed: expected ${test.expected}, got ${result}`, 'error');
                }
            } catch (error) {
                failed++;
                this.output(`❌ Test ${index + 1} error: ${error.message}`, 'error');
            }
        });

        this.output(`\n📊 Results: ${passed} passed, ${failed} failed`, passed === this.currentExercise.testCases.length ? 'success' : 'warning');
    }

    showSolution() {
        if (!this.currentExercise || !this.currentExercise.solution) {
            this.output('⚠️ No solution available for this exercise', 'warning');
            return;
        }

        const confirmShow = confirm('Are you sure you want to see the solution? Try to solve it yourself first!');
        if (!confirmShow) return;

        this.editor.setValue(this.currentExercise.solution);
        this.output('💡 Solution loaded. Study it carefully and try to understand each part.', 'info');
    }

    resetCode() {
        if (!this.currentExercise) return;

        const confirmReset = confirm('Reset code to starter template? Your changes will be lost.');
        if (!confirmReset) return;

        this.editor.setValue(this.currentExercise.starterCode || '');
        this.userCode.delete(this.currentExercise.id);
        this.clearOutput();
        this.output('🔄 Code reset to starter template', 'info');
    }

    output(text, type = 'info') {
        const outputEl = document.getElementById('code-output');
        if (!outputEl) return;

        const line = document.createElement('div');
        line.className = `output-line output-${type}`;
        line.textContent = text;

        outputEl.appendChild(line);
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    clearOutput() {
        const outputEl = document.getElementById('code-output');
        if (outputEl) {
            outputEl.innerHTML = '';
        }
    }

    // Public API
    loadExerciseById(exerciseId) {
        const exercise = this.curriculum.exercises.find(ex => ex.id === exerciseId);
        if (exercise) {
            this.loadExercise(exercise);
        }
    }

    getProgress() {
        const completed = Array.from(this.userCode.keys()).length;
        const total = this.curriculum.exercises.length;
        return { completed, total, percentage: (completed / total) * 100 };
    }

    saveProgress() {
        const progress = {
            userCode: Array.from(this.userCode.entries()),
            currentExerciseId: this.currentExercise?.id
        };
        localStorage.setItem('academy_tutorial_progress', JSON.stringify(progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('academy_tutorial_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.userCode = new Map(progress.userCode);
            if (progress.currentExerciseId) {
                this.loadExerciseById(progress.currentExerciseId);
            }
        }
    }

    destroy() {
        if (this.editor) {
            this.editor.dispose();
        }
        this.saveProgress();
    }
}

// Make it globally accessible for inline event handlers
if (typeof window !== 'undefined') {
    window.TutorialSystem = TutorialSystem;
}
