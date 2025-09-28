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
  onCollapseChange: () => void;
}
export const Navbar = React.memo(({ currentPage, onCollapseChange, months, perPage, allMonths, startIndex, setAllMonths, onScrollToMonth, onScrollToWeek, onScrollToDay }: Props) => {

  const [collapsed, setCollapsed] = useState<boolean[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: string]: boolean }>({});

  const refs = useRef([]);

  useEffect(() => {
    const updateHeights = () => {
      refs.current.forEach((ref, index) => {
        if (ref) {
          ref.style.height = collapsed[index] ? '0px' : 'auto';
          ref.style.transition = 'height 0.3s ease';
        }
      });
    };

    updateHeights();

    const observer = new MutationObserver(updateHeights);
    refs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref, { childList: true, subtree: true });
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [allMonths, collapsed]);

  const toggleCollapse = (monthIndex) => {
    const newCollapsed = [...collapsed];
    newCollapsed[monthIndex] = !newCollapsed[monthIndex];
    setCollapsed(newCollapsed);

    if (onCollapseChange) {
      requestAnimationFrame(() => onCollapseChange());
    }
  };


  const handleDragStart = (result) => {
    const { source } = result;
    const sourceMonthIndex = parseInt(source.droppableId.split('-')[1], 10);
    if (refs.current[sourceMonthIndex]) {
      refs.current[sourceMonthIndex].style.height = 'auto';
    }
  };

  const getRealIndex = (index: number) => {
    return startIndex + index;
  };

  const handleDragEnd = (result) => {
    const { destination, source, type } = result;
    if (!destination) return;
    const updatedMonths = [...allMonths];

    if (type === 'month') {
      const [movedMonth] = updatedMonths.splice(getRealIndex(source.index), 1);
      updatedMonths.splice(getRealIndex(destination.index), 0, movedMonth);
    }
    else if (type === 'week') {
      const sourceMonthIndex = getRealIndex(parseInt(source.droppableId.split('-')[1], 10));
      const destMonthIndex = getRealIndex(parseInt(destination.droppableId.split('-')[1], 10));
      const [movedWeek] = updatedMonths[sourceMonthIndex].weeks.splice(source.index, 1);
      updatedMonths[destMonthIndex].weeks.splice(destination.index, 0, movedWeek);
    }
    setAllMonths(updatedMonths);

    setTimeout(() => {
      refs.current.forEach((ref, index) => {
        if (ref) {
          ref.style.height = collapsed[index] ? '0px' : 'auto';
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
                      <div ref={provided.innerRef} {...provided.draggableProps} className="border p-2 rounded bg-white shadow w-full">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center w-full">
                            <div
                              {...provided.dragHandleProps}
                              className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg"
                            >
                              <FaGripVertical className="text-black" />
                            </div>
                            <div
                              className="cursor-pointer"
                              onClick={() => onScrollToMonth(monthIndex)}
                            >
                              <div className="text-sm font-semibold text-gray-800">
                                Month {(currentPage - 1) * perPage + monthIndex + 1}
                              </div>
                              <div className="inline-block text-xs font-medium text-black">
                                {month.title}
                              </div>
                            </div>
                          </div>

                          <div className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
                            <Button
                              variant="danger"
                              name="collapse"
                              startIcon={
                                collapsed[monthIndex] ? (
                                  <ChevronDownIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronUpIcon className="h-4 w-4" />
                                )
                              }
                              onClick={() => toggleCollapse(monthIndex)}
                              className="ml-4"
                            />
                          </div>
                        </div>
                        <div
                          ref={(el) => (refs.current[monthIndex] = el)}
                          style={{
                            overflow: 'hidden',
                            transition: 'height 0.3s ease',
                          }}
                        >
                          <Droppable droppableId={`month-${month.localId}`} type="week">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="pl-2">
                                {month.weeks.length === 0 ? (
                                  <div className="text-gray-500">No weeks</div>
                                ) : (
                                  month.weeks.map((week, weekIndex) => (

                                    <Draggable key={week.localId} draggableId={`month-${month.localId}-week-${week.localId}`} index={weekIndex}>
                                      {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="border p-2 my-2 bg-gray-200 rounded w-full">
                                          <div className="flex items-center ">
                                            <div {...provided.dragHandleProps} className="w-4 h-4 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
                                              <FaGripVertical className="text-black" />
                                            </div>
                                            <div
                                              className="cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const key = `${monthIndex}-${weekIndex}`;
                                                setExpandedWeeks(prev => ({
                                                  ...prev,
                                                  [key]: !prev[key],
                                                }));
                                                onScrollToWeek(getRealIndex(monthIndex), weekIndex);
                                              }}
                                            >
                                              <div className="text-md font-semibold">
                                                Week {weekIndex + 1}
                                                {expandedWeeks[`${monthIndex}-${weekIndex}`] ? (
                                                  <ChevronUpIcon className="inline-block h-3 w-3 ml-1" />
                                                ) : (
                                                  <ChevronDownIcon className="inline-block h-3 w-3 ml-1" />
                                                )}
                                              </div>
                                              <div className="text-sm text-gray-600">{week.title}</div>
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
                                                  height: expandedWeeks[`${monthIndex}-${weekIndex}`] ? 'auto' : 0,
                                                }}
                                              >
                                                {week.days.map((day, dayIndex) => (
                                                  <div
                                                    key={day.localId}
                                                    className="border p-2 bg-gray-300 rounded w-full"
                                                  >
                                                    <span
                                                      className="cursor-pointer w-full block"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        onScrollToDay(getRealIndex(monthIndex), weekIndex, dayIndex);
                                                      }}
                                                    >
                                                      <div className="text-sm font-semibold text-gray-800">
                                                        Day {day.typeId}
                                                      </div>
                                                      <div className="text-xs font-medium text-black w-full">
                                                        {day.title}
                                                      </div>
                                                    </span>
                                                  </div>
                                                ))}
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
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});