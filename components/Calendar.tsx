import React, { useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import styles from './Calendar.module.css';

type CalendarProps = {
  availability: { [date: string]: { rooms: number, booked: number } };
  onDateClick: (date: Date) => void;
  selectedDate: Date | null; // 追加
};

const Calendar: React.FC<CalendarProps> = ({ availability, onDateClick, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  const getAvailability = (date: Date) => {
    const dateString = format(date, 'yyyy_MM_dd');
    return availability[dateString];
  };

  const isDateAvailable = (date: Date) => {
    const avail = getAvailability(date);
    return avail && (avail.rooms - avail.booked) > 0;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date) && isSameMonth(date, currentMonth)) {
      onDateClick(date);
    }
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));

    let date = startDate;
    while (date <= endDate) {
      const formattedDate = format(date, 'yyyy_MM_dd');
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const isAvailable = isDateAvailable(date);

      days.push(
        <div
          key={date.toString()}
          className={`${styles.day} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''} ${isAvailable ? styles.available : styles.unavailable}`}
          onClick={() => handleDateClick(date)}
        >
          <span>{format(date, 'd')}</span>
          {isAvailable && <span className={styles.rooms}>残り: {availability[formattedDate].rooms - availability[formattedDate].booked}</span>}
        </div>
      );
      date = addDays(date, 1);
    }
    return <div className={styles.daysGrid}>{days}</div>;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth}>前の月</button>
        <div>{format(currentMonth, 'yyyy年 MM月')}</div>
        <button onClick={handleNextMonth}>次の月</button>
      </div>
      <div className={styles.daysNames}>
        <div>日</div>
        <div>月</div>
        <div>火</div>
        <div>水</div>
        <div>木</div>
        <div>金</div>
        <div>土</div>
      </div>
      {renderDays()}
    </div>
  );
};

export default Calendar;
