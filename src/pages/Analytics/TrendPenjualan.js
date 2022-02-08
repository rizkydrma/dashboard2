import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { getAnalyticsTrend } from '../../api/analytics';

import Chart from 'react-apexcharts';
import Table from '../../components/table/Table';

import { useReactToPrint } from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import image from '../../assets/images/logo_rosid_red.png';
import Button from '../../elements/Button/Button';
import { socket } from '../../app/websocket';

function TrendPenjualan() {
  const [data, setData] = useState([]);
  const themeReducer = useSelector((state) => state.theme.mode);
  const [chartOption, setChartOption] = useState(null);
  let date = new Date();
  date.setMonth(date.getMonth() + 1);
  const month = date.toLocaleString('default', { month: 'long' });

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const trendColumns = useMemo(
    () => [
      { Header: 'Bulan', accessor: '_id' },
      { Header: 'Total', accessor: 'totalAmount' },
    ],
    [],
  );
  const trendData = useMemo(() => [...data], [data]);

  const fetchData = useCallback(async () => {
    let { data } = await getAnalyticsTrend();

    if (data.error) {
      console.log(data.error);
      return;
    }
    setData(data);
    setChartOption({
      series: [
        {
          name: 'Penjualan',
          data: data.map((order) => order.totalAmount),
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
  }, []);

  useEffect(() => {
    fetchData();
    socket.on('thisNewOrder', (data) => {
      fetchData();
    });

    return function cleanup() {
      socket.off('thisNewOrder', (data) => {
        console.log('socket off' + data);
      });
    };
  }, [fetchData]);
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Trend Penjualan</h1>
      <div className="row" style={{ marginBottom: 10 }}>
        <div className="col-4">
          <Button
            className="btn btn-theme btn-lg btn-block"
            onClick={handlePrint}
          >
            <FontAwesomeIcon icon={faPrint} />
            Print to PDF
          </Button>
        </div>
      </div>

      <div className="row" ref={componentRef}>
        <div className="col-11">
          <div className="card full-height">
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
            <h1 style={{ fontSize: '1.3rem', marginBottom: 15 }}>
              Grafik Prediksi Trend Penjualan
            </h1>
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
                height="270"
                type="area"
              />
            )}
          </div>
        </div>
        <div className="col-7">
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
                Analisis trend penjualan ini menggunakan metode
                <span style={{ fontStyle: 'italic' }}> least square</span>{' '}
                dimana data terbaru akan lebih relevan untuk menggambarkan data
                yang dicari. Jumlah data sebelumnya yang digunakan sebanyak{' '}
                {data.length - 1} data, dimana{' '}
                {data.map((item, idx) =>
                  idx === data.length - 1
                    ? ''
                    : `data ke-${idx + 1} menunjukan penjualan sebesar Rp.${
                        item.totalAmount
                      }, `,
                )}{' '}
                setelah dilakukan analisis dapat disimpulkan prediksi penjualan
                untuk bulan selanjutnya yaitu bulan{' '}
                <span style={{ fontWeight: 'bolder' }}>
                  {month}
                  {data[data.length - 2].totalAmount <
                  data[data.length - 1].totalAmount
                    ? ' Naik '
                    : ' Turun '}
                </span>{' '}
                dari bulan sebelumnya karena diprediksi mendapatkan{' '}
                <span style={{ fontWeight: 'bolder' }}>
                  Rp.
                  {data[data.length - 1].totalAmount.toString()}.
                </span>
              </p>
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
      </div>
    </div>
  );
}

export default TrendPenjualan;
