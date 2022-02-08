import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { config } from '../../config';
import { useReactToPrint } from 'react-to-print';

import { ExportToExcel } from '../../components/export-to-excel';

import { DateRangePicker } from 'react-date-range';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faPrint } from '@fortawesome/free-solid-svg-icons';
import image from '../../assets/images/logo_rosid_red.png';

import Button from '../../elements/Button/Button';
import Table from '../../components/table/Table';

export default function Report() {
  const [isShow, setIsShow] = useState(false);
  const [data, setData] = useState([]);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleFilterDate = (item) => {
    setDate([item.selection]);
  };

  const reportData = useMemo(() => data, [data]);

  const reportColumns = useMemo(
    () => [
      {
        Header: '#',
        Cell: (row) => {
          return <div>{Number(row.row.id) + 1}</div>;
        },
      },
      {
        Header: 'Nama Produk',
        accessor: 'name',
      },
      {
        Header: 'Harga Satuan',
        accessor: 'price',
      },
      {
        Header: 'Jumlah',
        accessor: 'qty',
      },
      {
        Header: 'Sub Total',
        accessor: 'subTotal',
      },
      {
        Header: 'Tax(10%)',
        accessor: 'tax',
      },
      {
        Header: 'Total Harga',
        accessor: 'total',
      },
    ],
    [],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    let { token } = localStorage.getItem('auth')
      ? JSON.parse(localStorage.getItem('auth'))
      : {};
    const fetchData = () => {
      axios
        .get(`${config.api_host}/api/generateReport`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
          params: {
            startDate: date[0].startDate,
            endDate: date[0].endDate,
          },
        })
        .then((res) => {
          let result = res.data;
          let newResult = [
            ...result.data.map((order) => {
              delete order.order;
              return {
                ...order,
              };
            }),
          ];

          newResult = newResult
            .map((item, i, array) => {
              const defaultValue = {
                name: item.name,
                price: item.price,
                qty: 0,
                subTotal: 0,
                tax: 0,
                total: 0,
              };
              const finalValue = array
                .filter((other) => other.name === item.name) //we filter the same items
                .reduce((accum, currentVal) => {
                  //we reduce them into a single entry
                  accum.qty += currentVal.qty;
                  accum.subTotal = accum.price * accum.qty;
                  accum.tax = accum.subTotal * 0.1;
                  accum.total = accum.subTotal + accum.tax;
                  return accum;
                }, defaultValue);

              return finalValue;
            })
            .filter((item, thisIndex, array) => {
              //now our new array has duplicates, lets remove them
              const index = array.findIndex(
                (otherItem, otherIndex) =>
                  otherItem.name === item.name &&
                  otherIndex !== thisIndex &&
                  otherIndex > thisIndex,
              );

              return index === -1;
            });

          console.log(newResult);

          setData(newResult);
        });
    };
    fetchData();
    return function cleanup() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [date]);

  const refDate = useRef(null);
  const handleClickOutside = (event) => {
    if (refDate && !refDate.current.contains(event.target)) {
      setIsShow(false);
    }
  };
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Report</h1>
      <div className="row">
        <div className="col-4">
          <div className="input-date" ref={refDate}>
            <button
              className="btn btn-theme btn-block"
              onClick={() => setIsShow(!isShow)}
              style={{ marginBottom: '10px' }}
            >
              <FontAwesomeIcon icon={faCalendar} /> Filter Berdasarkan Tanggal
            </button>
            {isShow && (
              <div className="date-range-wrapper">
                <DateRangePicker
                  onChange={(item) => handleFilterDate(item)}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  ranges={date}
                />
              </div>
            )}
            <div className="row">
              <div className="col-6">
                <ExportToExcel apiData={data} fileName="LaporanPenjualan" />
              </div>
              <div className="col-6">
                <Button
                  className="btn btn-theme btn-lg btn-block"
                  onClick={handlePrint}
                >
                  <FontAwesomeIcon icon={faPrint} />
                  Print to PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-8">
          <h4 style={{ fontSize: '1.2rem', marginBottom: 15 }}>Range Date</h4>
          <span>Start : {date[0].startDate.toDateString()}</span> <br />
          <br />
          <span>End : {date[0].endDate.toDateString()}</span>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card" ref={componentRef}>
            <div
              className="report-heading"
              style={{
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img alt="A test " src={image} style={{ width: '130px' }} />
              <span
                style={{ fontSize: '2rem', fontWeight: 600, color: '#FC1D1D' }}
              >
                Studio Rosid
              </span>
            </div>

            <div
              className="report-subTitle"
              style={{ width: '100%', textAlign: 'center' }}
            >
              <h2 style={{ fontSize: '1.8rem' }}>Laporan Penjualan</h2>
              <h5>
                {date[0].startDate.toDateString()} -{' '}
                {date[0].endDate.toDateString()}
              </h5>
            </div>
            <Table columns={reportColumns} data={reportData} />
          </div>
        </div>
      </div>
    </div>
  );
}
