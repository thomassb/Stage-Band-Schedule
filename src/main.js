let bands = JSON.parse(localStorage.getItem('bands') || '[]');

let currentActiveIndex = -1;

/* ===== STORAGE ===== */

function saveBands() {
    localStorage.setItem('bands', JSON.stringify(bands));
}

/* ===== UTILITIES ===== */
let wakeLock = null;

async function enableWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request("screen");

        console.log("Wake Lock active");

        wakeLock.addEventListener("release", () => {
            console.log("Wake Lock released");
        });

    } catch (err) {
        console.error(err);
    }
}
document.addEventListener("click", enableWakeLock, {
    once: true
});

document.addEventListener("visibilitychange", async () => {

    if (
        wakeLock === null &&
        document.visibilityState === "visible"
    ) {
        await enableWakeLock();
    }

});

function todayDateTime(timeString) {

    const [hours, minutes] = timeString.split(':');

    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        Number(hours),
        Number(minutes),
        0
    );
}

function formatDuration(ms) {

    if (ms < 0) ms = 0;

    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hours}h ${mins}m ${secs}s`;
}

/* ===== BANDS ===== */

function addBand() {

    const name = document.getElementById('bandName').value.trim();
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;

    if (!name || !start || !end) {
        alert('Please complete all fields');
        return;
    }

    bands.push({
        name,
        start,
        end
    });

    bands.sort((a, b) =>
        a.start.localeCompare(b.start)
    );

    saveBands();
    render();

    document.getElementById('bandName').value = '';
}

function deleteBand(index) {

    if (!confirm('Delete this band?')) {
        return;
    }

    bands.splice(index, 1);

    saveBands();
    render();
}

/* ===== SCHEDULE ===== */

function buildSchedule() {

    const schedule = [];

    const sorted = [...bands].sort((a, b) =>
        a.start.localeCompare(b.start)
    );

    for (let i = 0; i < sorted.length; i++) {

        const band = sorted[i];

        schedule.push({
            type: 'band',
            title: band.name,
            start: band.start,
            end: band.end
        });

        const next = sorted[i + 1];

        if (next && band.end < next.start) {

            schedule.push({
                type: 'changeover',
                title: '🔄 CHANGEOVER',
                start: band.end,
                end: next.start
            });
        }
    }

    return schedule;
}

/* ===== RENDER ===== */

function render() {

    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    const schedule = buildSchedule();

    schedule.forEach((item, index) => {

        const div = document.createElement('div');

        div.id = `event-${index}`;

        div.className =
            item.type === 'changeover'
            ? 'event changeover'
            : 'event';

        let deleteButton = '';

        if (item.type === 'band') {

            const bandIndex = bands.findIndex(
                b => b.name === item.title &&
                     b.start === item.start
            );

            deleteButton =
                `<button class="delete-btn"
                    onclick="deleteBand(${bandIndex})">
                    Delete
                </button>`;
        }

        div.innerHTML = `
            <div class="event-header">

                <div>
                    <div class="title">${item.title}</div>
                    <div class="time">
                        ${item.start} - ${item.end}
                    </div>
                </div>

                ${deleteButton}

            </div>

            <div class="countdown"
                 id="countdown-${index}">
            </div>
        `;

        timeline.appendChild(div);
    });

    updateCountdowns();
}

/* ===== CLOCK ===== */

function updateClock() {

    const now = new Date();

    document.getElementById('clock').textContent =
        now.toLocaleTimeString('en-GB');
}

/* ===== COUNTDOWNS ===== */

function updateCountdowns() {

    const now = new Date();

    const schedule = buildSchedule();

    let nextEvent = null;
    let nextRemaining = null;

    document
        .querySelectorAll('.event')
        .forEach(el => el.classList.remove('active'));

    schedule.forEach((item, index) => {

        const start = todayDateTime(item.start);
        const end = todayDateTime(item.end);

        const countdownEl =
            document.getElementById(`countdown-${index}`);

        const cards =
            document.querySelectorAll('.event');

        let html = '';

        if (now < start) {

            const diff = start - now;

            html = `
                <span class="status-upcoming">
                    Starts in ${formatDuration(diff)}
                </span>
            `;

            if (!nextRemaining || diff < nextRemaining) {
                nextRemaining = diff;
                nextEvent = item;
            }

        }
        else if (now >= start && now <= end) {

            const diff = end - now;

            html = `
                <span class="status-live">
                    ${item.type === 'changeover'
                        ? 'Ends'
                        : 'Finishes'}
                    in ${formatDuration(diff)}
                </span>
            `;

            cards[index].classList.add('active');

            if (currentActiveIndex !== index) {

                currentActiveIndex = index;

                const el =
                    document.getElementById(`event-${index}`);

                setTimeout(() => {

                    window.scrollTo({
                        top: el.offsetTop -
                             (window.innerHeight * 0.7),
                        behavior: 'smooth'
                    });

                }, 250);
            }

        }
        else {

            html = `
                <span class="status-ended">
                    Completed
                </span>
            `;
        }

        countdownEl.innerHTML = html;
    });

    const banner =
        document.getElementById('nextEvent');

    if (nextEvent) {

        banner.innerHTML =
            `NEXT: ${nextEvent.title}<br>
             <span style="font-size:3em">
             ${formatDuration(nextRemaining)}
             </span>`;
    }
    else {

        const active = schedule.find(item => {

            const start =
                todayDateTime(item.start);

            const end =
                todayDateTime(item.end);

            return now >= start && now <= end;
        });

        if (active) {

            banner.innerHTML =
                `LIVE NOW<br>${active.title}`;
        }
        else {

            banner.innerHTML =
                'No More Events Today';
        }
    }
}

/* ===== START ===== */

render();

updateClock();
updateCountdowns();

setInterval(() => {

    updateClock();
    updateCountdowns();

}, 1000);
