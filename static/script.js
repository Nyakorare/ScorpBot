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

    // Toggle sidebar visibility with animation
    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('visible');
        if (sidebar.classList.contains('visible')) {
            toggleButton.innerHTML = '<i class="fas fa-times"></i> Close FAQ';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-lightbulb"></i> FAQ';
        }
    });

    closeButton.addEventListener('click', function() {
        sidebar.classList.remove('visible');
        toggleButton.innerHTML = '<i class="fas fa-lightbulb"></i> FAQ';
    });

    // Dark mode toggle with animation
    darkModeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add transition class to body for smooth theme change
        document.body.classList.add('theme-transition');
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateDarkModeButton(newTheme);
        
        // Remove transition class after animation completes
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 500);
    });

    function updateDarkModeButton(theme) {
        const icon = darkModeToggle.querySelector('i');
        const text = darkModeToggle.querySelector('span');
        
        // Animate the icon change
        icon.style.transform = 'rotate(360deg)';
        icon.style.transition = 'transform 0.5s ease';
        
        setTimeout(() => {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                text.textContent = ' Light Mode';
            } else {
                icon.className = 'fas fa-moon';
                text.textContent = ' Dark Mode';
            }
            icon.style.transform = 'rotate(0)';
        }, 250);
    }

    // Handle prompt clicks with animation
    promptItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
            
            const prompt = this.getAttribute('data-prompt');
            userInput.value = prompt;
            sendButton.click();
            sidebar.classList.remove('visible');
            toggleButton.innerHTML = '<i class="fas fa-lightbulb"></i> FAQ';
        });
    });

    // Handle send button with animation
    sendButton.addEventListener('click', function (event) {
        event.preventDefault();
        const message = userInput.value.trim();
        if (message === "") return;

        // Add button click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);

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

            // Add bot response with media preview if links are found
            addMessageToChat(formatResponse(data.response), 'bot-message');
        })
        .catch(error => {
            console.error('Error:', error);
            chatContainer.removeChild(typingIndicator);
            addMessageToChat("Sorry, I'm having trouble responding. Please try again later.", 'bot-message');
        });
    });

    // Handle clear chat with animation
    clearChatButton.addEventListener('click', function () {
        // Add button click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        // Animate chat clearing
        chatContainer.style.opacity = '0';
        chatContainer.style.transform = 'translateY(20px)';
        chatContainer.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            chatContainer.innerHTML = '';
            chatContainer.style.opacity = '1';
            chatContainer.style.transform = 'translateY(0)';
            addMessageToChat(botIntroduction, 'bot-message');
        }, 300);
    });

    // Handle Enter key press
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // Helper functions
    function addMessageToChat(message, className) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper', className);
        messageWrapper.style.animationDelay = `${chatContainer.children.length * 0.1}s`;

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
        
        // Extract and display media if links are found
        if (className === 'bot-message') {
            extractAndDisplayMedia(message, messageWrapper);
        }
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function extractAndDisplayMedia(message, messageWrapper) {
        // Extract URLs from message
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.match(urlRegex);
        
        if (!urls) return;
        
        urls.forEach(url => {
            try {
                const parsedUrl = new URL(url);
                
                // Check for image extensions
                if (/\.(jpeg|jpg|gif|png|webp)$/.test(parsedUrl.pathname.toLowerCase())) {
                    const mediaContainer = document.createElement('div');
                    mediaContainer.classList.add('media-preview');
                    
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = 'Preview image';
                    img.onerror = () => mediaContainer.remove();
                    
                    mediaContainer.appendChild(img);
                    messageWrapper.appendChild(mediaContainer);
                } 
                // Check for video extensions or YouTube
                else if (/\.(mp4|webm|mov)$/.test(parsedUrl.pathname.toLowerCase())) {  // Added missing closing parenthesis
                    const mediaContainer = document.createElement('div');
                    mediaContainer.classList.add('media-preview');
                    
                    const video = document.createElement('video');
                    video.src = url;
                    video.controls = true;
                    video.onerror = () => mediaContainer.remove();
                    
                    mediaContainer.appendChild(video);
                    messageWrapper.appendChild(mediaContainer);
                } 
                // Check for YouTube URLs
                else if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
                    let videoId;
                    if (parsedUrl.hostname.includes('youtu.be')) {
                        videoId = parsedUrl.pathname.slice(1);
                    } else {
                        videoId = parsedUrl.searchParams.get('v');
                    }
                    
                    if (videoId) {
                        const mediaContainer = document.createElement('div');
                        mediaContainer.classList.add('media-preview');
                        
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.youtube.com/embed/${videoId}`;
                        iframe.frameBorder = '0';
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        iframe.allowFullscreen = true;
                        
                        mediaContainer.appendChild(iframe);
                        messageWrapper.appendChild(mediaContainer);
                    }
                }
            } catch (e) {
                console.error('Invalid URL:', url);
            }
        });
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