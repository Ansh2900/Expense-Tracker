(function () {
    // Antigravity Local Agent Demo

    function showAgentOverlay(text) {
        let overlay = document.getElementById('agent-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'agent-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '20px';
            overlay.style.left = '50%';
            overlay.style.transform = 'translateX(-50%)';
            overlay.style.backgroundColor = '#111827';
            overlay.style.color = '#10B981';
            overlay.style.padding = '15px 30px';
            overlay.style.borderRadius = '30px';
            overlay.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
            overlay.style.zIndex = '10000';
            overlay.style.fontFamily = 'monospace';
            overlay.style.fontWeight = 'bold';
            overlay.style.border = '2px solid #10B981';
            overlay.innerHTML = '<span style="margin-right:10px">🤖</span> <span id="agent-text"></span>';
            document.body.appendChild(overlay);
        }
        document.getElementById('agent-text').innerText = text;
    }

    // Capture errors to overlay
    const originalConsoleError = console.error;
    console.error = function (...args) {
        originalConsoleError.apply(console, args);
        const msg = args.map(a => (a && a.message) ? a.message : String(a)).join(' ');
        showAgentOverlay(`⚠️ Error: ${msg.substring(0, 30)}...`);
    };

    // Override alert to not block
    const originalAlert = window.alert;
    window.alert = function (msg) {
        showAgentOverlay(`🔔 Alert: ${msg}`);
        console.log("Alert suppressed:", msg);
        return true;
    };

    async function wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function type(selector, text) {
        const el = document.querySelector(selector);
        if (!el) return;
        el.focus();
        el.value = ''; // clear
        for (let char of text) {
            el.value += char;
            el.dispatchEvent(new Event('input'));
            await wait(50 + Math.random() * 50);
        }
    }

    async function click(selector) {
        const el = document.querySelector(selector);
        if (el) {
            const original = el.style.transform;
            el.style.transition = '0.1s';
            el.style.transform = 'scale(0.95)';
            el.style.boxShadow = '0 0 15px #10B981';
            await wait(200);
            el.click();
            el.style.transform = original;
            el.style.boxShadow = 'none';
        }
    }

    async function runLoginDemo() {
        if (!document.getElementById('login-form')) return;

        // Ensure we are on register if that's the plan
        // Actually, let's just do a login if we have a user, or register if we want dynamic
        // Let's go for FULL FLOW: Register -> Login

        // Check if we are already on register view
        if (document.getElementById('register-box').style.display === 'none') {
            showAgentOverlay("Agent: Starting Registration...");
            const link = document.getElementById('show-register');
            if (link) {
                link.click();
                await wait(500);
            }
        }

        const rand = Math.floor(Math.random() * 1000);
        const user = `agent_${rand}`;
        const pass = 'password123';

        showAgentOverlay("Agent: Filling details...");
        await type('#reg-username', user);
        await type('#reg-email', `${user}@demo.com`);
        await type('#reg-password', pass);
        await wait(500);

        showAgentOverlay("Agent: Creating account...");
        await click('#register-form button');
        await wait(1500); // Wait for fetch and alert suppression

        // Now we should be able to login
        // App logic says: showLoginBtn.click() on success
        // So we should be back at login form

        showAgentOverlay("Agent: Logging in...");
        await type('#login-email', `${user}@demo.com`);
        await type('#login-password', pass);
        await wait(500);

        await click('#login-form button');
        // Redirect happens
    }

    async function runDashboardDemo() {
        if (!document.getElementById('total-balance')) return;

        showAgentOverlay("Agent: Analyzing Dashboard...");
        await wait(2000);

        // Check for Categories
        const catSelect = document.querySelector('#t-category');
        if (catSelect && catSelect.options.length <= 1) {
            showAgentOverlay("Agent: Waiting for categories...");
            // Retry fetch if needed?
            // Actually, just wait a bit longer
            await wait(3000);
            if (catSelect.options.length <= 1) {
                showAgentOverlay("⚠️ Categories failed to load!");
                // attempt manual injection for visual demo only?
                // No, that hides the bug.
                return;
            }
        }

        showAgentOverlay("Agent: Adding income...");
        await type('#t-description', 'Freelance Project');
        await wait(500);
        await type('#t-amount', '1500.00');

        const dateInput = document.querySelector('#t-date');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

        if (catSelect) {
            // 1 is usually valid if seed ran
            catSelect.selectedIndex = 1;
            catSelect.dispatchEvent(new Event('change')); // Trigger any listeners
        }

        await wait(500);
        const btn = document.querySelector('#add-transaction-form button');
        if (btn) btn.click();

        await wait(2500);

        showAgentOverlay("Agent: Adding expense...");
        await type('#t-description', 'Server Costs');
        // Clear amount first? type() clears it.
        await type('#t-amount', '50.00');

        if (catSelect && catSelect.options.length > 2) {
            catSelect.selectedIndex = 2; // Expense usually
            catSelect.dispatchEvent(new Event('change'));
        }

        if (btn) btn.click();
        await wait(2000);

        showAgentOverlay("Agent: Demo Complete! You have control.");
        setTimeout(() => {
            const el = document.getElementById('agent-overlay');
            if (el) el.remove();
            localStorage.removeItem('agent_demo_running');
        }, 4000);
    }

    // Auto-Run Logic
    window.addEventListener('load', () => {
        const state = localStorage.getItem('agent_demo_running');

        if (!state && document.getElementById('login-form')) {
            // Start fresh
            localStorage.setItem('agent_demo_running', 'step1');
            runLoginDemo();
        } else if (state === 'step1') {
            // We were running, check where we are
            if (document.getElementById('total-balance')) {
                // We made it!
                localStorage.setItem('agent_demo_running', 'step2');
                runDashboardDemo();
            } else if (document.getElementById('login-form')) {
                // We might be at login step of runLoginDemo?
                // Actually the page might have reloaded? 
                // If we are at login, we should continue.
                // But runLoginDemo handles the full sequence.
                // If we reloaded AT LOGIN, we lost the variables.
                // Restart?
                localStorage.removeItem('agent_demo_running');
            }
        }
    });

    // Manual Trigger Backup
    window.startAgentDemo = function () {
        localStorage.removeItem('agent_demo_running');
        location.reload();
    };

})();
