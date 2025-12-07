import React from 'react';
import { Button } from '@/components/Elements';
import { Month } from '@/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical } from 'react-icons/fa';

interface Props {
  currentPage: number;
  perPage: number;
  months: Month[];
  allMonths: Month[];
  setAllMonths: (months: Month[]) => void;
  onScrollToMonth: (monthIndex: number) => void;
  onScrollToWeek: (monthIndex: number, weekIndex: number) => void;
  onScrollToDay: (monthIndex: number, weekIndex: number, dayIndex: number) => void;
  startIndex: number;
  onCollapseChange: (monthLocalId: string, isCollapsed: boolean) => void;
  expandedMonths: { [key: string]: boolean };
  expandedWeeks: { [key: string]: boolean };
  setExpandedWeeks: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  expandedDays: { [key: string]: boolean };
  setExpandedDays: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

export const Navbar = React.memo(
  ({
    currentPage,
    onCollapseChange,
    months,
    perPage,
    allMonths,
    startIndex,
    setAllMonths,
    onScrollToMonth,
    onScrollToWeek,
    onScrollToDay, expandedMonths,
    expandedWeeks,
    setExpandedWeeks,
    expandedDays,
    setExpandedDays
  }: Props) => {
    const refs = useRef<(HTMLDivElement | null)[]>([]);

    const handleDragStart = (result: any) => {
      const { source } = result;
      const sourceMonthIndex = parseInt(source.droppableId.split('-')[1], 10);
      if (refs.current[sourceMonthIndex]) {
        refs.current[sourceMonthIndex]!.style.height = 'auto';
      }
    };

    const getRealIndex = (index: number) => {
      return startIndex + index;
    };

    const handleDragEnd = (result: any) => {
      const { destination, source, type } = result;
      if (!destination) return;
      const updatedMonths = [...allMonths];

      if (type === 'month') {
        const [movedMonth] = updatedMonths.splice(getRealIndex(source.index), 1);
        updatedMonths.splice(getRealIndex(destination.index), 0, movedMonth);
      } else if (type === 'week') {
        const sourceMonthIndex = getRealIndex(parseInt(source.droppableId.split('-')[1], 10));
        const destMonthIndex = getRealIndex(parseInt(destination.droppableId.split('-')[1], 10));
        const [movedWeek] = updatedMonths[sourceMonthIndex].weeks.splice(source.index, 1);
        updatedMonths[destMonthIndex].weeks.splice(destination.index, 0, movedWeek);
      }
      setAllMonths(updatedMonths);
      setTimeout(() => {
        refs.current.forEach((ref, index) => {
          const month = months[index];
          if (ref && month) {
            const isCollapsed = !(expandedMonths[month.localId]);
            ref.style.height = isCollapsed ? '0px' : 'auto';
          }
        });
      }, 0);
    };

    return (
      <div>
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="navbar" type="month">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="bg-gray-100">
                {months.map((month, monthIndex) => {
                  return (
                    <Draggable key={month.localId} draggableId={`month-${month.localId}`} index={monthIndex}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border p-2 rounded bg-white shadow w-full mb-3"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center w-full">
                              <div
                                {...provided.dragHandleProps}
                                className="w-4 h-4 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg"
                              >
                                <FaGripVertical className="text-black" />
                              </div>
                              <div className="cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                const realIndex = getRealIndex(monthIndex);
                                onScrollToMonth(realIndex);
                              }}>
                                <div
                                  className="text-sm font-semibold text-gray-800"
                                >
                                  Month {(currentPage - 1) * perPage + monthIndex + 1}
                                </div>
                                <div className="inline-block text-xs font-medium text-black">{month.title}</div>
                              </div>
                            </div>

                            <div className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
                              <Button
                                variant="danger"
                                name="collapse"
                                startIcon={
                                  !(expandedMonths[month.localId]) ? (
                                    <ChevronDownIcon className="h-4 w-4" />
                                  ) : (
                                    <ChevronUpIcon className="h-4 w-4" />
                                  )
                                }
                                onClick={() => {
                                  const isCollapsedNow = !(expandedMonths[month.localId]);
                                  const newCollapsed = !isCollapsedNow;
                                  onCollapseChange(month.localId, newCollapsed);
                                  requestAnimationFrame(() => {
                                    if (newCollapsed) {
                                      const prevMonthIndex = Math.max(monthIndex - 1, 0);
                                      onScrollToMonth(getRealIndex(prevMonthIndex));
                                    } else {
                                      onScrollToMonth(getRealIndex(monthIndex));
                                    }
                                  });
                                }}
                                className="ml-4"
                              />
                            </div>
                          </div>
                          <div
                            ref={(el) => (refs.current[monthIndex] = el)}
                            style={{
                              height: expandedMonths[month.localId] ? 'auto' : 0,
                              overflow: 'hidden',
                              transition: 'height 0.3s ease'
                            }}
                          >
                            <Droppable droppableId={`month-${month.localId}`} type="week">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="pl-2">
                                  {month.weeks.length === 0 ? (
                                    <div className="text-gray-500">No weeks</div>
                                  ) : (
                                    month.weeks.map((week, weekIndex) => (
                                      <Draggable
                                        key={week.localId}
                                        draggableId={`month-${month.localId}-week-${week.localId}`}
                                        index={weekIndex}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="border p-2 my-2 bg-gray-200 rounded w-full"
                                          >
                                            <div className="flex items-center w-full text-sm">
                                              <div
                                                {...provided.dragHandleProps}
                                                className="w-6 h-6 mr-2 flex items-center justify-center cursor-pointer rounded-full shadow-sm bg-white"
                                              >
                                                <FaGripVertical className="text-gray-800" />
                                              </div>

                                              <div className="cursor-pointer flex-1">
                                                <div
                                                  className="font-medium"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    onScrollToWeek(getRealIndex(monthIndex), weekIndex);
                                                  }}
                                                >
                                                  Week {weekIndex + 1}
                                                </div>
                                                <div className="text-xs text-gray-600">{week.title}</div>
                                              </div>
                                              <div
                                                className="w-4 h-4 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg"
                                              >
                                                <Button
                                                  variant="danger"
                                                  name="collapse"
                                                  startIcon={
                                                    expandedWeeks[`${month.localId}-${week.localId}`] ? (
                                                      <ChevronUpIcon className="h-3 w-3 text-white" />
                                                    ) : (
                                                      <ChevronDownIcon className="h-3 w-3 text-white" />
                                                    )
                                                  }
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const key = `${month.localId}-${week.localId}`;
                                                    const isExpanded = !!expandedWeeks[key];
                                                    setExpandedWeeks(prev => ({
                                                      ...prev,
                                                      [key]: !isExpanded,
                                                    }));

                                                    requestAnimationFrame(() => {
                                                      if (!isExpanded) {
                                                        onScrollToWeek(getRealIndex(monthIndex), weekIndex);
                                                      } else {
                                                        const prevWeekIndex = Math.max(weekIndex - 1, 0);
                                                        if (weekIndex > 0) {
                                                          onScrollToWeek(getRealIndex(monthIndex), prevWeekIndex);
                                                        } else {
                                                          onScrollToMonth(getRealIndex(monthIndex));
                                                        }
                                                      }
                                                    });
                                                  }}
                                                />
                                              </div>
                                            </div>

                                            <div className="pl-12 min-h-[50px]">
                                              {week.days.length === 0 ? (
                                                <div className="text-gray-500">No days</div>
                                              ) : (
                                                <div
                                                  style={{
                                                    overflow: 'hidden',
                                                    transition: 'height 0.3s ease',
                                                    height: expandedWeeks[`${month.localId}-${week.localId}`] ? 'auto' : 0,
                                                  }}
                                                >
                                                  {week.days.map((day, dayIndex) => {
                                                    const dayKey = `${month.localId}-${week.localId}-${day.localId}`;
                                                    const isExpanded = !!expandedDays[dayKey];

                                                    return (
                                                      <div key={day.localId} className="border p-2 bg-gray-300 rounded w-full">
                                                        <div className="flex items-center justify-between text-sm">
                                                          <span
                                                            className="cursor-pointer flex-1"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              onScrollToDay(getRealIndex(monthIndex), weekIndex, dayIndex);
                                                            }}
                                                          >
                                                            <div className="font-semibold text-gray-800">Day {day.typeId}</div>
                                                            <div className="text-xs font-medium text-black">{day.title}</div>
                                                          </span>
                                                          <Button
                                                            variant="danger"
                                                            name="collapse"
                                                            startIcon={
                                                              isExpanded ? (
                                                                <ChevronUpIcon className="h-3 w-3 text-white" />
                                                              ) : (
                                                                <ChevronDownIcon className="h-3 w-3 text-white" />
                                                              )
                                                            }
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setExpandedDays((prev) => {
                                                                const updated = { ...prev, [dayKey]: !isExpanded };
                                                                return updated;
                                                              });

                                                              setTimeout(() => {
                                                                if (!isExpanded) {
                                                                  onScrollToDay(getRealIndex(monthIndex), weekIndex, dayIndex);
                                                                } else {
                                                                  const prevDayIndex = Math.max(dayIndex - 1, 0);
                                                                  if (dayIndex > 0) {
                                                                    onScrollToDay(getRealIndex(monthIndex), weekIndex, prevDayIndex);
                                                                  } else {
                                                                    onScrollToWeek(getRealIndex(monthIndex), weekIndex);
                                                                  }
                                                                }
                                                              }, 150);
                                                            }}
                                                          />
                                                        </div>
                                                        <div
                                                          style={{
                                                            overflow: 'hidden',
                                                            transition: 'height 0.3s ease',
                                                            height: isExpanded ? 'auto' : 0,
                                                          }}
                                                          className="pl-6 mt-1"
                                                        >                                                 {(day.exercises.length > 0 || day.warmups.length > 0) ? (
                                                          <>
                                                            <div className="text-xs text-gray-600">
                                                              Exercises: {day.exercises.length} | Warmups: {day.warmups.length}
                                                            </div>
                                                          </>
                                                        ) : (
                                                          <div className="text-xs text-gray-500">No details</div>
                                                        )}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}

                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }
);
