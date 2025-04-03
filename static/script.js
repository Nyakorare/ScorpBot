document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user_input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat');
    const toggleButton = document.getElementById('toggle-prompts');
    const closeButton = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const promptItems = document.querySelectorAll('.prompt-item');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateDarkModeButton(currentTheme);

    // Bot introduction message
    const botIntroduction = `
        <strong>Hello!</strong> I'm ScorpBot, your Senior High School Assistant for Centro Escolar University.
        <br><br>I can help with CEU Senior High School matters including:
        <br><i class="fas fa-circle" style="font-size: 6px; vertical-align: middle; color: var(--secondary)"></i> Academic programs (STEM, ABM, HUMSS, GAS)
        <br><i class="fas fa-circle" style="font-size: 6px; vertical-align: middle; color: var(--secondary)"></i> Enrollment requirements
        <br><i class="fas fa-circle" style="font-size: 6px; vertical-align: middle; color: var(--secondary)"></i> Campus information
        <br><br>Please keep your questions related to CEU Senior High School.
        <br><br>Click <i class="fas fa-lightbulb" style="color: var(--primary)"></i> <strong>FAQ</strong> for quick questions!
    `;

    // Initialize chat
    addMessageToChat(botIntroduction, 'bot-message');

    // Toggle sidebar visibility
    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('visible');
    });

    closeButton.addEventListener('click', function() {
        sidebar.classList.remove('visible');
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateDarkModeButton(newTheme);
    });

    function updateDarkModeButton(theme) {
        const icon = darkModeToggle.querySelector('i');
        const text = darkModeToggle.querySelector('span');

        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = ' Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = ' Dark Mode';
        }
    }

    // Handle prompt clicks
    promptItems.forEach(item => {
        item.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            userInput.value = prompt;
            sendButton.click();
            sidebar.classList.remove('visible');
        });
    });

    // Handle send button
    sendButton.addEventListener('click', function (event) {
        event.preventDefault();
        const message = userInput.value.trim();
        if (message === "") return;

        // Add user message
        addMessageToChat(message, 'user-message');
        userInput.value = '';

        // Add typing indicator
        const typingIndicator = addTypingIndicator();

        fetch('/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_input: message }),
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            chatContainer.removeChild(typingIndicator);

            // Add bot response
            addMessageToChat(formatResponse(data.response), 'bot-message');
        })
        .catch(error => {
            console.error('Error:', error);
            chatContainer.removeChild(typingIndicator);
            addMessageToChat("Sorry, I'm having trouble responding. Please try again later.", 'bot-message');
        });
    });

    // Handle clear chat
    clearChatButton.addEventListener('click', function () {
        chatContainer.innerHTML = '';
        addMessageToChat(botIntroduction, 'bot-message');
    });

    // Helper functions
    function addMessageToChat(message, className) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper', className);

        // Profile Icon
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('profile-icon');

        if (className === 'user-message') {
            iconDiv.classList.add('user-icon');
            iconDiv.innerHTML = '<i class="fas fa-user"></i>';
        } else {
            iconDiv.classList.add('bot-icon');
        }

        messageWrapper.appendChild(iconDiv);

        // Message Bubble
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('message-bubble');
        bubbleDiv.innerHTML = message;
        messageWrapper.appendChild(bubbleDiv);

        chatContainer.appendChild(messageWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function formatResponse(text) {
        // Convert Markdown-like formatting to HTML
        text = text.replace(/\n- /g, '<br><i class="fas fa-circle" style="font-size: 6px; vertical-align: middle; color: var(--secondary)"></i> ');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--primary)">$1</a>');

        // Ensure "Let me know..." is properly formatted
        text = text.replace(/\n\nLet me know/g, '<br><br>Let me know');
        return text;
    }

    function addTypingIndicator() {
        const typingWrapper = document.createElement('div');
        typingWrapper.classList.add('message-wrapper', 'bot-message');

        // Profile Icon
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('profile-icon', 'bot-icon');
        typingWrapper.appendChild(iconDiv);

        // Typing Indicator
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');

        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('dots-container');

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dotsContainer.appendChild(dot);
        }

        typingDiv.appendChild(dotsContainer);
        typingWrapper.appendChild(typingDiv);

        chatContainer.appendChild(typingWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return typingWrapper;
    }
});