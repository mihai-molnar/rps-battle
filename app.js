function spawnItems(num, type) {
    for (let i = 0; i < num; i++) {
        const item = document.createElement('div');
        item.classList.add('item');
        item.classList.add(type);
        if (type === 'scissor') {
            item.innerHTML = '✂️';
        }
        if (type === 'paper') {
            item.innerHTML = '📃';
        }
        if (type === 'rock') {
            item.innerHTML = '🪨';
        }
        // Random position within the arena, accounting for item size
        item.style.left = `${Math.random() * 360}px`;
        item.style.top = `${Math.random() * 360}px`;
        // Add initial animation
        item.style.opacity = '0';
        item.style.transform = 'scale(0)';
        arena.appendChild(item);
        
        // Trigger entrance animation
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        }, Math.random() * 500);
    }
}

function moveItems() {
    const items = document.getElementsByClassName('item');
    const arena = document.getElementById('arena');
    const maxX = arena.clientWidth - 40;  // Account for emoji size
    const maxY = arena.clientHeight - 40;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const randomAngle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50; // Random distance between 50 and 150 pixels
        
        // Calculate new position using trigonometry for more natural movement
        const currentX = parseFloat(item.style.left) || 0;
        const currentY = parseFloat(item.style.top) || 0;
        
        let newX = currentX + Math.cos(randomAngle) * distance;
        let newY = currentY + Math.sin(randomAngle) * distance;
        
        // Keep items within bounds
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        item.style.left = `${newX}px`;
        item.style.top = `${newY}px`;
    }
}

function detectCollision(item1, item2) {
    const rect1 = item1.getBoundingClientRect();
    const rect2 = item2.getBoundingClientRect();
    
    return rect1.left < rect2.right &&
           rect1.right > rect2.left &&
           rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top;
}

let moveInterval;
let collisionInterval;
const startButton = document.getElementById('start-button');
const winnerDisplay = document.getElementById('winner-display');
const arena = document.getElementById('arena');
const itemCountInput = document.getElementById('item-count');
const counters = {
    rock: document.querySelector('.counter.rock span'),
    paper: document.querySelector('.counter.paper span'),
    scissor: document.querySelector('.counter.scissor span')
};

// Validate input value
itemCountInput.addEventListener('change', () => {
    const value = parseInt(itemCountInput.value);
    if (value < 1) itemCountInput.value = 1;
    if (value > 50) itemCountInput.value = 50;
});

function updateCounters() {
    const items = document.getElementsByClassName('item');
    const counts = {
        rock: 0,
        paper: 0,
        scissor: 0
    };
    
    for (const item of items) {
        const type = item.classList[1];
        counts[type]++;
    }
    
    // Update counter displays
    for (const type in counts) {
        counters[type].textContent = counts[type];
    }
}

function startGame() {
    // Clear previous game state
    arena.innerHTML = '';
    winnerDisplay.textContent = '';
    
    // Reset all counter styles
    const allCounters = document.querySelectorAll('.counter');
    allCounters.forEach(counter => {
        counter.style.animation = 'none';
        counter.style.filter = 'none';
    });
    
    // Get number of items from input
    const itemCount = parseInt(itemCountInput.value);
    
    // Reset counters
    for (const type in counters) {
        counters[type].textContent = itemCount;
    }
    
    // Spawn items
    spawnItems(itemCount, 'scissor');
    spawnItems(itemCount, 'paper');
    spawnItems(itemCount, 'rock');
    
    // Start intervals
    moveInterval = setInterval(moveItems, 1000);
    collisionInterval = setInterval(checkCollisions, 50);
    
    // Disable start button during game
    startButton.disabled = true;
}

function stopGame() {
    clearInterval(moveInterval);
    clearInterval(collisionInterval);
    startButton.disabled = false;
}

function checkWinner() {
    const items = document.getElementsByClassName('item');
    if (items.length === 0) {
        winnerDisplay.innerHTML = "🏆 It's a draw! Everyone lost! 🏆";
        stopGame();
        return true;
    }

    // Count how many of each type remain
    const typeCounts = {
        rock: 0,
        paper: 0,
        scissor: 0
    };

    for (const item of items) {
        const type = item.classList[1];
        typeCounts[type]++;
    }

    // Filter out types with zero count
    const remainingTypes = Object.entries(typeCounts)
        .filter(([_, count]) => count > 0)
        .map(([type]) => type);

    if (remainingTypes.length <= 2) {
        let winner;
        if (remainingTypes.length === 1) {
            winner = remainingTypes[0];
        } else {
            // When 2 types remain, determine winner based on RPS rules
            const [type1, type2] = remainingTypes;
            if (
                (type1 === 'rock' && type2 === 'scissor') ||
                (type1 === 'scissor' && type2 === 'paper') ||
                (type1 === 'paper' && type2 === 'rock')
            ) {
                winner = type1;
            } else {
                winner = type2;
            }
        }

        const emoji = winner === 'rock' ? '🪨' : winner === 'paper' ? '📃' : '✂️';
        winnerDisplay.innerHTML = `🏆 ${emoji} ${winner.toUpperCase()} WINS! ${emoji} 🏆`;
        
        // Celebrate the winners
        const winners = document.getElementsByClassName(winner);
        for (const item of winners) {
            item.style.filter = 'drop-shadow(0 0 20px gold)';
            item.style.animation = 'pulse 1s infinite';
        }
        
        stopGame();
        return true;
    }

    return false;
}

function checkCollisions() {
    const items = Array.from(document.getElementsByClassName('item'));
    
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const item1 = items[i];
            const item2 = items[j];
            
            if (!item1.parentNode || !item2.parentNode) continue; // Skip if already removed
            
            if (detectCollision(item1, item2)) {
                const type1 = item1.classList[1]; // rock, paper, or scissor
                const type2 = item2.classList[1];
                
                if (
                    (type1 === 'rock' && type2 === 'scissor') ||
                    (type1 === 'scissor' && type2 === 'paper') ||
                    (type1 === 'paper' && type2 === 'rock')
                ) {
                    item2.remove();
                } else if (
                    (type2 === 'rock' && type1 === 'scissor') ||
                    (type2 === 'scissor' && type1 === 'paper') ||
                    (type2 === 'paper' && type1 === 'rock')
                ) {
                    item1.remove();
                }
            }
        }
    }
    
    updateCounters();
    checkWinner();
}

// Add click event listener to start button
startButton.addEventListener('click', startGame);