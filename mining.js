// Mining Configuration
const MINING_CONFIG = {
    baseHashRate: 0.1, // Base hash rate in H/s
    difficultyMultiplier: 0.0001, // Difficulty multiplier
    updateInterval: 1000, // Update interval in milliseconds
    maxMiningTime: 24 * 60 * 60 * 1000, // Maximum mining time (24 hours)
    communityUpdateInterval: 5000, // Community activity update interval
    rewardRate: 0.00000001, // Base reward rate per hash
    maxDailyReward: 0.001 // Maximum daily reward in BTC
};

// Mining State
const miningState = {
    isMining: false,
    startTime: null,
    totalMined: 0,
    currentHashRate: 0,
    miningInterval: null,
    communityInterval: null,
    dailyStats: [],
    weeklyStats: [],
    lastUpdate: null
};

// Initialize mining data from localStorage
function initializeMiningData() {
    const savedData = localStorage.getItem('miningData');
    if (savedData) {
        const data = JSON.parse(savedData);
        miningState.totalMined = data.totalMined || 0;
        miningState.dailyStats = data.dailyStats || generateInitialStats(7);
        miningState.weeklyStats = data.weeklyStats || generateInitialStats(30);
        
        // Restore mining state if it was active
        if (data.isMining) {
            miningState.startTime = data.startTime || Date.now();
            miningState.lastUpdate = Date.now();
            startMining();
        }
    } else {
        miningState.dailyStats = generateInitialStats(7);
        miningState.weeklyStats = generateInitialStats(30);
    }
    updateUI();
}

// Generate initial statistics
function generateInitialStats(days) {
    const stats = [];
    const now = Date.now();
    for (let i = 0; i < days; i++) {
        stats.push({
            date: new Date(now - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: Math.random() * 0.0001,
            hashRate: Math.random() * 0.5 + 0.1
        });
    }
    return stats;
}

// Save mining data to localStorage
function saveMiningData() {
    const data = {
        totalMined: miningState.totalMined,
        dailyStats: miningState.dailyStats,
        weeklyStats: miningState.weeklyStats,
        isMining: miningState.isMining,
        startTime: miningState.startTime,
        currentHashRate: miningState.currentHashRate,
        lastSaved: Date.now()
    };
    localStorage.setItem('miningData', JSON.stringify(data));
}

// Calculate mining reward
function calculateMiningReward(elapsedTime) {
    const hashRate = MINING_CONFIG.baseHashRate * (1 + Math.random() * 0.5);
    const hashes = hashRate * (elapsedTime / 1000);
    const reward = hashes * MINING_CONFIG.rewardRate;
    return {
        reward: Math.min(reward, MINING_CONFIG.maxDailyReward / (24 * 60 * 60)),
        hashRate: hashRate
    };
}

// Start mining
function startMining() {
    if (miningState.isMining) return;

    miningState.isMining = true;
    miningState.startTime = Date.now();
    miningState.lastUpdate = Date.now();
    miningState.currentHashRate = MINING_CONFIG.baseHashRate;

    // Update mining status
    document.querySelector('.status-text').textContent = 'Mining in Progress';
    document.querySelector('.status-dot').classList.add('mining');
    document.getElementById('startMining').innerHTML = '<i class="fas fa-stop"></i> Stop Mining';

    // Start mining interval
    miningState.miningInterval = setInterval(updateMining, MINING_CONFIG.updateInterval);
    
    // Start community updates
    startCommunityUpdates();
    
    // Initialize charts
    initializeMiningChart();
}

// Stop mining
function stopMining() {
    if (!miningState.isMining) return;

    miningState.isMining = false;
    clearInterval(miningState.miningInterval);
    clearInterval(miningState.communityInterval);

    // Update mining status
    document.querySelector('.status-text').textContent = 'Mining Stopped';
    document.querySelector('.status-dot').classList.remove('mining');
    document.getElementById('startMining').innerHTML = '<i class="fas fa-play"></i> Start Mining';

    // Save mining data
    saveMiningData();
}

// Update mining process
function updateMining() {
    const now = Date.now();
    const elapsedTime = now - miningState.lastUpdate;
    miningState.lastUpdate = now;

    const { reward, hashRate } = calculateMiningReward(elapsedTime);
    miningState.totalMined += reward;
    miningState.currentHashRate = hashRate;

    // Update statistics
    updateStatistics(reward, hashRate);

    // Update UI
    updateUI();

    // Save mining data more frequently (every 10 seconds)
    if (now % 10000 < MINING_CONFIG.updateInterval) {
        saveMiningData();
    }
}

// Update statistics
function updateStatistics(reward, hashRate) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Update daily stats
    const dailyStat = miningState.dailyStats.find(stat => stat.date === today);
    if (dailyStat) {
        dailyStat.amount += reward;
        dailyStat.hashRate = (dailyStat.hashRate + hashRate) / 2;
    } else {
        miningState.dailyStats.push({
            date: today,
            amount: reward,
            hashRate: hashRate
        });
        if (miningState.dailyStats.length > 30) {
            miningState.dailyStats.shift();
        }
    }

    // Update UI statistics
    updateStatisticsUI();
}

// Update statistics UI
function updateStatisticsUI() {
    // Update main statistics
    document.getElementById('totalMinedStats').textContent = miningState.totalMined.toFixed(8) + ' BTC';
    document.getElementById('currentHashRateStats').textContent = miningState.currentHashRate.toFixed(2) + ' H/s';
    document.getElementById('miningTimeStats').textContent = formatMiningTime();

    // Update chart
    updateMiningChart();
}

// Format mining time
function formatMiningTime() {
    if (!miningState.startTime) return '00:00:00';
    const elapsed = Date.now() - miningState.startTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize mining chart
function initializeMiningChart() {
    const ctx = document.getElementById('miningChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: miningState.dailyStats.map(stat => stat.date),
            datasets: [{
                label: 'Hash Rate (H/s)',
                data: miningState.dailyStats.map(stat => stat.hashRate),
                borderColor: '#f7931a',
                backgroundColor: 'rgba(247, 147, 26, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hash Rate (H/s)'
                    }
                }
            }
        }
    });
}

// Update mining chart
function updateMiningChart() {
    const ctx = document.getElementById('miningChart').getContext('2d');
    const chart = Chart.getChart(ctx);
    
    if (chart) {
        chart.data.labels = miningState.dailyStats.map(stat => stat.date);
        chart.data.datasets[0].data = miningState.dailyStats.map(stat => stat.hashRate);
        chart.update();
    }
}

// Update UI elements
function updateUI() {
    // Update total mined
    document.getElementById('totalMined').textContent = miningState.totalMined.toFixed(8) + ' BTC';
    
    // Update mining speed
    document.getElementById('miningSpeed').textContent = miningState.currentHashRate.toFixed(2) + ' H/s';
    
    // Update time active
    if (miningState.isMining) {
        const elapsedTime = Date.now() - miningState.startTime;
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        document.getElementById('timeActive').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update user balance
    document.querySelector('.user-balance').textContent = miningState.totalMined.toFixed(8) + ' BTC';
}

// Generate random user activity
function generateRandomActivity() {
    const users = ['MinerPro', 'CryptoKing', 'BitcoinWizard', 'HashMaster', 'BlockChainQueen'];
    const actions = ['mined', 'found', 'discovered'];
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const amount = (Math.random() * 0.001).toFixed(8);
    const time = new Date().toLocaleTimeString();

    return {
        user,
        action,
        amount,
        time
    };
}

// Start community updates
function startCommunityUpdates() {
    miningState.communityInterval = setInterval(() => {
        const activity = generateRandomActivity();
        const activityList = document.getElementById('activityList');
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-user">${activity.user}</div>
            <div class="activity-details">
                <span class="activity-action">${activity.action}</span>
                <span class="activity-amount">${activity.amount} BTC</span>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Keep only last 10 activities
        if (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }, MINING_CONFIG.communityUpdateInterval);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mining data
    initializeMiningData();
    
    // Mining button click handler
    const miningButton = document.getElementById('startMining');
    miningButton.addEventListener('click', () => {
        if (miningState.isMining) {
            stopMining();
        } else {
            startMining();
        }
    });

    // Time filter buttons
    const timeFilterButtons = document.querySelectorAll('.time-filter button');
    timeFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const period = button.dataset.period;
            updateChartPeriod(period);
        });
    });

    // Initialize chart
    initializeMiningChart();
});

// Update chart period
function updateChartPeriod(period) {
    let stats;
    switch (period) {
        case '24h':
            stats = miningState.dailyStats.slice(-1);
            break;
        case '7d':
            stats = miningState.dailyStats.slice(-7);
            break;
        case '30d':
            stats = miningState.dailyStats.slice(-30);
            break;
        default:
            stats = miningState.dailyStats;
    }
    
    const ctx = document.getElementById('miningChart').getContext('2d');
    const chart = Chart.getChart(ctx);
    
    if (chart) {
        chart.data.labels = stats.map(stat => stat.date);
        chart.data.datasets[0].data = stats.map(stat => stat.hashRate);
        chart.update();
    }
}