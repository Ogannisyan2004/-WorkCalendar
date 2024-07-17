document.addEventListener('DOMContentLoaded', function() {
    const startDateInput = document.getElementById('start-date');
    const generateButton = document.getElementById('generate-btn');
    const scheduleList = document.getElementById('schedule-list');
    const totalHoursElement = document.getElementById('total-hours');
    const extraWorkDateInput = document.getElementById('extra-work-date');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const addExtraWorkDayButton = document.getElementById('add-extra-work-day-btn');
    const workDays = 2;
    const offDays = 3;
    const daysToGenerate = 30;
    const hoursPerWorkDay = 12;
    let monthlyHours = {};
    let totalHours = 0;

    function updateTotalHours() {
        let monthlyHoursText = '';
        for (const [monthYear, hours] of Object.entries(monthlyHours)) {
            monthlyHoursText += `<p>${monthYear}: ${hours.toFixed(1)} часов</p>`;
        }
        totalHoursElement.innerHTML = `<p>Общее количество рабочих часов: ${totalHours.toFixed(1)}</p>` + monthlyHoursText;
    }

    function generateSchedule() {
        const selectedStartDate = new Date(startDateInput.value);

        if (isNaN(selectedStartDate.getTime())) {
            alert('Пожалуйста, выберите корректную дату.');
            return;
        }

        let currentDate = new Date(selectedStartDate);
        scheduleList.innerHTML = '';
        totalHoursElement.innerHTML = '';

        let count = 0;
        totalHours = 0;
        monthlyHours = {};
        let isWorkDay = true;

        while (count < daysToGenerate) {
            if (isWorkDay) {
                for (let i = 0; i < workDays; i++) {
                    const li = document.createElement('li');
                    const dayName = currentDate.toLocaleDateString('ru-RU', { weekday: 'long' });
                    const dateString = currentDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
                    li.textContent = `${dayName}, ${dateString}`;
                    li.classList.add('list-group-item');
                    scheduleList.appendChild(li);

                    const monthYear = currentDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
                    if (!monthlyHours[monthYear]) {
                        monthlyHours[monthYear] = 0;
                    }
                    monthlyHours[monthYear] += hoursPerWorkDay;

                    currentDate.setDate(currentDate.getDate() + 1);
                    count++;
                    totalHours += hoursPerWorkDay;
                    if (count >= daysToGenerate) {
                        break;
                    }
                }
                isWorkDay = false;
            } else {
                for (let i = 0; i < offDays; i++) {
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                isWorkDay = true;
            }
        }

        updateTotalHours();
        
    }

    function addExtraWorkDay() {
        const extraWorkDate = new Date(extraWorkDateInput.value);
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        if (isNaN(extraWorkDate.getTime()) || !endTime) {
            alert('Пожалуйста, выберите корректную дату и время.');
            return;
        }

        let startHours = 0;
        let startMinutes = 0;
        let endHours = 0;
        let endMinutes = 0;

        if (startTime) {
            [startHours, startMinutes] = startTime.split(':').map(Number);
        }
        if (endTime) {
            [endHours, endMinutes] = endTime.split(':').map(Number);
        }


        if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) {
            endHours += 24; 
        }

        const workStart = startHours + startMinutes / 60;
        const workEnd = endHours + endMinutes / 60;
        const workDuration = workEnd - workStart;

        if (workDuration <= 0) {
            alert('Конец работы должен быть позже начала работы.');
            return;
        }

        const li = document.createElement('li');
        const dayName = extraWorkDate.toLocaleDateString('ru-RU', { weekday: 'long' });
        const dateString = extraWorkDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
        li.textContent = `${dayName}, ${dateString} - с ${startTime || '20:00'} до ${endTime} (${workDuration.toFixed(1)} часов)`;
        li.classList.add('list-group-item');

        const items = Array.from(scheduleList.children);
        let inserted = false;
        for (let i = 0; i < items.length; i++) {
            const itemDate = new Date(items[i].textContent.split(' - ')[0].split(', ')[1]);
            if (extraWorkDate < itemDate) {
                scheduleList.insertBefore(li, items[i]);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            scheduleList.appendChild(li);
        }

        const monthYear = extraWorkDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
        if (!monthlyHours[monthYear]) {
            monthlyHours[monthYear] = 0;
        }
        monthlyHours[monthYear] += workDuration;
        totalHours += workDuration;

        updateTotalHours();

        extraWorkDateInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
    }

    generateButton.addEventListener('click', generateSchedule);
    addExtraWorkDayButton.addEventListener('click', addExtraWorkDay);
});