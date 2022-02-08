import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { getAnalyticsProduct } from '../../api/analytics';

import Chart from 'react-apexcharts';
import Table from '../../components/table/Table';
import { DateRangePicker } from 'react-date-range';
import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faCalendar } from '@fortawesome/free-solid-svg-icons';
import image from '../../assets/images/logo_rosid_red.png';
import Button from '../../elements/Button/Button';

import { socket } from '../../app/websocket';

function TopProducts() {
  const [data, setData] = useState([]);
  const [isShow, setIsShow] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const themeReducer = useSelector((state) => state.theme.mode);
  const [chartOption, setChartOption] = useState(null);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const refDate = useRef(null);
  const handleClickOutside = (event) => {
    if (refDate && !refDate.current.contains(event.target)) {
      setIsShow(false);
    }
  };

  const trendColumns = useMemo(
    () => [
      { Header: 'nama', accessor: '_id' },
      { Header: 'qty', accessor: 'qty' },
    ],
    [],
  );
  const trendData = useMemo(() => [...data], [data]);

  const fetchData = useCallback(async () => {
    let { data } = await getAnalyticsProduct(
      date[0].startDate,
      date[0].endDate,
    );

    if (data.error) {
      console.log(data.error);
      return;
    }
    setData(data);
    setChartOption({
      series: [
        {
          name: 'Penjualan',
          data: data.map((order) => order.qty),
        },
      ],
      options: {
        color: ['#6ab04c', '#2980b9'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        colors: ['#00BAEC'],
        fill: {
          gradient: {
            enabled: true,
            opacityFrom: 0.55,
            opacityTo: 0,
          },
        },
        xaxis: {
          categories: data.map((order) => order._id),
        },
        legend: {
          position: 'top',
        },
        grid: {
          show: false,
        },
      },
    });
  }, [date]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    fetchData();
    socket.on('thisNewOrder', (data) => {
      fetchData();
    });
    return function cleanup() {
      document.removeEventListener('mousedown', handleClickOutside);
      socket.off('thisNewOrder', (data) => {
        console.log('socket off ' + data);
      });
    };
  }, [fetchData, date]);

  const handleFilterDate = (item) => {
    setDate([item.selection]);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Trend Penjualan</h1>
      <div className="row">
        <div className="col-4">
          <Button
            className="btn btn-theme btn-lg btn-block"
            onClick={handlePrint}
          >
            <FontAwesomeIcon icon={faPrint} />
            Print to PDF
          </Button>
        </div>
        <div className="col-4">
          <div className="input-date" ref={refDate}>
            <button
              className="btn btn-theme btn-lg btn-block"
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
          </div>
        </div>
      </div>

      <div className="row" ref={componentRef}>
        <div className="col-12">
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
          <div className="row">
            <div className="col-4">
              <h1 style={{ fontSize: '1.3rem' }}>Grafik Top Produk</h1>
            </div>
            <div className="col-8">
              Tanggal: {date[0].startDate.toDateString()} -{' '}
              {date[0].endDate.toDateString()}
            </div>
          </div>
        </div>
        <div className="col-8">
          <div className="card">
            {chartOption !== null && (
              <Chart
                options={
                  themeReducer === 'theme-mode-dark'
                    ? {
                        ...chartOption.options,
                        theme: { mode: 'dark' },
                      }
                    : {
                        ...chartOption.options,
                        theme: { mode: 'light' },
                      }
                }
                series={chartOption.series}
                type="area"
              />
            )}
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card__header">
              <h4>Data List</h4>
            </div>
            <div className="card__body">
              {data.length > 0 && (
                <Table columns={trendColumns} data={trendData} />
              )}
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card">
            <h1 style={{ fontSize: '1.3rem', marginBottom: 15 }}>Deskripsi</h1>
            {data.length > 0 && (
              <p
                style={{
                  fontSize: '1rem',
                  letterSpacing: '0.8px',
                  lineHeight: 1.2,
                }}
              >
                Dalam grafik 7 produk terlaris diatas dapat dilihat bahwa produk
                <span style={{ fontWeight: 'bold' }}> {data[0]._id}</span>{' '}
                merupakan produk paling banyak diminati pelanggan karena telah
                terjual sebanyak{' '}
                <span style={{ fontWeight: 'bold' }}>{data[0].qty}</span>buah,
                diikuti oleh{' '}
                {data.map((item, idx) =>
                  idx === 0
                    ? ''
                    : `${item._id} terjual sebanyak ${item.qty}buah, `,
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopProducts;
