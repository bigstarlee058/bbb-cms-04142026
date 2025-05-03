import { ArchiveIcon } from '@heroicons/react/outline';
import * as React from 'react';

type TableColumn<Entry> = {
  title: string;
  field: keyof Entry;
  minwidth?: number;
  maxwidth?: number;
  width?: number;
  Cell?: ({ entry }: { entry: Entry }) => React.ReactElement;
};

export type TableProps<Entry> = {
  data: Entry[];
  columns: TableColumn<Entry>[];
};

// Utility type to check if a type is renderable as ReactNode
type Renderable = string | number | React.ReactNode;

export const Table = <Entry extends { _id: string }>({ data, columns }: TableProps<Entry>) => {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 bg-white h-80">
        <ArchiveIcon className="w-16 h-16" />
        <h4>No Entries Found</h4>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={column.title + index}
                      scope="col"
                      className={`${column.title == "Exercise Count" && "text-center"} px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase`}
                      style={{
                        ...(column.minwidth && { minWidth: `${column.minwidth}px` }), 
                        ...(column.maxwidth && { maxWidth: `${column.maxwidth}px` }), 
                        ...(column.width && { width: `${column.width}px` })}}
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((entry, entryIndex) => (
                  <tr key={entry?._id || entryIndex} className="odd:bg-white even:bg-gray-100">
                    {columns.map(({ Cell, field, title, minwidth, maxwidth, width }, columnIndex) => (
                      <td
                        key={title + columnIndex}
                        className={`${
                          columnIndex === 0 ? 'pl-4' : 'px-2'
                        } py-4 text-sm font-medium text-gray-900 ${title == "Exercise Count" && "text-center"}`}
                        style={{ 
                          ...(minwidth && { minWidth: `${minwidth}px` }), 
                          ...(maxwidth && { maxWidth: `${maxwidth}px` }), 
                          ...(width && { width: `${width}px` })}}
                      >
                        {Cell ? (
                          <Cell entry={entry} />
                        ) : (
                          // Type assertion here to assure TypeScript that this is a valid ReactNode
                          (entry[field] as Renderable)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
