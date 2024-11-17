import React from 'react';
import { Button } from '@/components/Elements';
import { Month } from '@/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical } from 'react-icons/fa';

interface Props {
  currentPage: number;
  months: Month[];
  allMonths: Month[];
  setAllMonths: (months: Month[]) => void;
  onScrollToMonth: (monthIndex: number) => void;
  onScrollToWeek: (monthIndex: number, weekIndex: number) => void;
  onScrollToDay: (monthIndex: number, weekIndex: number, dayIndex: number) => void;
}
export const Navbar = React.memo(({ currentPage, months, allMonths, setAllMonths, onScrollToMonth, onScrollToWeek, onScrollToDay } : Props) => {
  const [collapsed, setCollapsed] = useState(months.map(() => false));
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
  }, [months, collapsed]);

  const toggleCollapse = (monthIndex) => {
    const newCollapsed = [...collapsed];
    newCollapsed[monthIndex] = !newCollapsed[monthIndex];
    setCollapsed(newCollapsed);
  };

  const handleDragStart = (result) => {
    const { source } = result;
    const sourceMonthIndex = parseInt(source.droppableId.split('-')[1], 10);
    if (refs.current[sourceMonthIndex]) {
      refs.current[sourceMonthIndex].style.height = 'auto';
    }
  };

  const getRealIndex = index => {
    return 5 * (currentPage - 1) + index;
  }

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
    // else if (type === 'day') {
    //   const sourceMonthIndex = parseInt(source.droppableId.split('-')[1], 10);
    //   const destMonthIndex = parseInt(destination.droppableId.split('-')[1], 10);
    //   const sourceWeekIndex = parseInt(source.droppableId.split('-')[3], 10);
    //   const destWeekIndex = parseInt(destination.droppableId.split('-')[3], 10);
    //   const [movedDay] = updatedMonths[sourceMonthIndex].weeks[sourceWeekIndex].days.splice(source.index, 1);
    //   updatedMonths[destMonthIndex].weeks[destWeekIndex].days.splice(destination.index, 0, movedDay);
    // }

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
            <div {...provided.droppableProps} ref={provided.innerRef} className="px-3 bg-gray-100">
              {months.map((month, monthIndex) => (
                <Draggable key={monthIndex} draggableId={`month-${monthIndex}`} index={monthIndex}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="border p-2 rounded bg-white shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div {...provided.dragHandleProps} className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
                            <FaGripVertical className="text-black" />
                          </div>
                          <h2 className="text-md font-bold cursor-pointer" onClick={() => onScrollToMonth(monthIndex)}>
                            Month {(currentPage - 1) * 5 + monthIndex + 1} &nbsp;&nbsp;&nbsp; {month.title}
                          </h2>
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
                        <Droppable droppableId={`month-${monthIndex}`} type="week">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="pl-8">
                              {month.weeks.length === 0 ? (
                                <div className="text-gray-500">No weeks</div>
                              ) : (
                                month.weeks.map((week, weekIndex) => (
                                  <Draggable key={weekIndex} draggableId={`month-${monthIndex}-week-${weekIndex}`} index={weekIndex}>
                                    {(provided) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} className="border p-2 my-2 bg-gray-200 rounded">
                                        <div className="flex items-center mb-2">
                                          <div {...provided.dragHandleProps} className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
                                            <FaGripVertical className="text-black" />
                                          </div>
                                          <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onScrollToWeek(monthIndex, weekIndex); }}>
                                            Week {weekIndex + 1} &nbsp;&nbsp;&nbsp; {week.title}
                                          </span>
                                        </div>
                                        <div className="pl-12 min-h-[50px]">
                                          {week.days.length === 0 ? (
                                            <div className="text-gray-500">No days</div>
                                          ) : (
                                            week.days.map((day, dayIndex) => (
                                              <div key={dayIndex} className="border p-2 my-2 bg-gray-300 rounded">
                                                <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onScrollToDay(monthIndex, weekIndex, dayIndex); }}>
                                                  Day {day.typeId} &nbsp;&nbsp;&nbsp; {day.title}
                                                </span>
                                              </div>
                                            ))
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
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});

  // return (
  //   <div>
  //     <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
  //       <Droppable droppableId="navbar" type="month">
  //         {(provided) => (
  //           <div {...provided.droppableProps} ref={provided.innerRef} className="px-3 bg-gray-100">
  //             {months.map((month, monthIndex) => (
  //               <Draggable key={monthIndex} draggableId={`month-${monthIndex}`} index={monthIndex}>
  //                 {(provided) => (
  //                   <div ref={provided.innerRef} {...provided.draggableProps} className="border p-2 rounded bg-white shadow">
  //                     <div className="flex items-center justify-between">
  //                       <div className="flex items-center">
  //                         <div {...provided.dragHandleProps} className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
  //                           <FaGripVertical className="text-black" />
  //                         </div>
  //                         <h2 className="text-md font-bold cursor-pointer" onClick={() => onScrollToMonth(monthIndex)}>
  //                           Month {monthIndex + 1} &nbsp;&nbsp;&nbsp; {month.title}
  //                         </h2>
  //                       </div>
  //                       <div className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
  //                         <Button
  //                           variant="danger"
  //                           name="collapse"
  //                           startIcon={
  //                             collapsed[monthIndex] ? (
  //                               <ChevronDownIcon className="h-4 w-4" />
  //                             ) : (
  //                               <ChevronUpIcon className="h-4 w-4" />
  //                             )
  //                           }
  //                           onClick={() => toggleCollapse(monthIndex)}
  //                           className="ml-4"
  //                         />
  //                       </div>
  //                     </div>
  //                     <div
  //                       ref={(el) => (refs.current[monthIndex] = el)}
  //                       style={{
  //                         overflow: 'hidden',
  //                         transition: 'height 0.3s ease',
  //                       }}
  //                     >
  //                       <Droppable droppableId={`month-${monthIndex}`} type="week">
  //                         {(provided) => (
  //                           <div {...provided.droppableProps} ref={provided.innerRef} className="pl-8">
  //                             {month.weeks.length === 0 ? (
  //                               <div className="text-gray-500">No weeks</div>
  //                             ) : (
  //                               month.weeks.map((week, weekIndex) => (
  //                                 <Draggable key={weekIndex} draggableId={`month-${monthIndex}-week-${weekIndex}`} index={weekIndex}>
  //                                   {(provided) => (
  //                                     <div ref={provided.innerRef} {...provided.draggableProps} className="border p-2 my-2 bg-gray-200 rounded">
  //                                       <div className="flex items-center mb-2">
  //                                         <div {...provided.dragHandleProps} className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
  //                                           <FaGripVertical className="text-black" />
  //                                         </div>
  //                                         <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onScrollToWeek(monthIndex, weekIndex); }}>
  //                                           Week {weekIndex + 1} &nbsp;&nbsp;&nbsp; {week.title}
  //                                         </span>
  //                                       </div>
  //                                       <Droppable droppableId={`month-${monthIndex}-week-${weekIndex}`} type="day">
  //                                         {(provided) => (
  //                                           <div {...provided.droppableProps} ref={provided.innerRef} className="pl-12 min-h-[50px]">
  //                                             {week.days.length === 0 ? (
  //                                               <div className="text-gray-500">No days</div>
  //                                             ) : (
  //                                               week.days.map((day, dayIndex) => (
  //                                                 <Draggable key={dayIndex} draggableId={`month-${monthIndex}-week-${weekIndex}-day-${dayIndex}`} index={dayIndex}>
  //                                                   {(provided) => (
  //                                                     <div ref={provided.innerRef} {...provided.draggableProps} className="border p-2 my-2 bg-gray-300 rounded flex items-center">
  //                                                       <div {...provided.dragHandleProps} className="w-8 h-8 mr-4 flex items-center justify-center cursor-pointer rounded-full shadow-lg">
  //                                                         <FaGripVertical className="text-black" />
  //                                                       </div>
  //                                                       <span className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onScrollToDay(monthIndex, weekIndex, dayIndex); }}>
  //                                                         Day {day.typeId} &nbsp;&nbsp;&nbsp; {day.title}
  //                                                       </span>
  //                                                     </div>
  //                                                   )}
  //                                                 </Draggable>
  //                                               ))
  //                                             )}
  //                                             {provided.placeholder}
  //                                           </div>
  //                                         )}
  //                                       </Droppable>
  //                                     </div>
  //                                   )}
  //                                 </Draggable>
  //                               ))
  //                             )}
  //                             {provided.placeholder}
  //                           </div>
  //                         )}
  //                       </Droppable>
  //                     </div>
  //                   </div>
  //                 )}
  //               </Draggable>
  //             ))}
  //             {provided.placeholder}
  //           </div>
  //         )}
  //       </Droppable>
  //     </DragDropContext>
  //   </div>
  // );