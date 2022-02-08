import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSortBy, useTable, useGlobalFilter } from 'react-table';
import './table.css';
import GlobalFilter from './GlobalFilter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendar } from '@fortawesome/free-solid-svg-icons';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { DateRangePicker } from 'react-date-range';

const Table = (props) => {
  const [isShow, setIsShow] = useState(false);
  let tableHooks = (hooks) => {};

  if (props.tableHooks) tableHooks = props.tableHooks;

  const tableInstance = useTable(
    {
      columns: props.columns,
      data: props.data,
    },
    tableHooks,
    useGlobalFilter,
    useSortBy,
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter } = state;
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return function cleanup() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  const refDate = useRef(null);
  const handleClickOutside = (event) => {
    if (refDate && !refDate.current.contains(event.target)) {
      setIsShow(false);
    }
  };

  return (
    <>
      {props.withFeature && (
        <div className="row">
          <div className="col-4">
            {props.addData && (
              <Link to={props.addData} className="btn btn-theme">
                <FontAwesomeIcon icon={faPlus} /> Add Data
              </Link>
            )}
          </div>
          <div className="col-4">
            <div className="input-date" ref={refDate}>
              {props.filterDate && (
                <>
                  <button
                    className="btn btn-theme btn-block"
                    onClick={() => setIsShow(!isShow)}
                  >
                    <FontAwesomeIcon icon={faCalendar} /> Filter Berdasarkan
                    Tanggal
                  </button>
                  {isShow && (
                    <div className="date-range-wrapper">
                      <DateRangePicker
                        onChange={(item) => props.filterDate(item)}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={1}
                        ranges={props.date}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="col-4 ">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
          </div>
        </div>
      )}
      <div className="table-wrapper" ref={!props.withFeature ? refDate : null}>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps([
                      { className: column.className },
                      column.getSortByToggleProps(),
                    ])}
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
