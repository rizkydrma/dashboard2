import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import Button from '../../elements/Button/Button';
import { useReactToPrint } from 'react-to-print';
import Table from '../../components/table/Table';

import image from '../../assets/images/logo_rosid_red.png';
import { getAnalyticsOneProduct } from '../../api/analytics';

import { socket } from '../../app/websocket';

let date = new Date();
date.setMonth(date.getMonth() + 1);
const month = date.toLocaleString('default', { month: 'long' });

function TrendProduct() {
  const { name } = useParams();
  const [data, setData] = useState([]);
  const [chartOption, setChartOption] = useState(null);
  const themeReducer = useSelector((state) => state.theme.mode);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const trendProduct = useMemo(
    () => [
      { Header: 'Bulan', accessor: '_id' },
      { Header: 'qty', accessor: 'qty' },
    ],
    [],
  );
  const trendData = useMemo(() => [...data], [data]);

  const fetchOneProduct = useCallback(async () => {
    let { data } = await getAnalyticsOneProduct(name);

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
  }, [name]);

  useEffect(() => {
    fetchOneProduct();
    socket.on('thisNewOrder', (data) => {
      fetchOneProduct();
    });
    return function cleanup() {
      socket.off('thisNewOrder', (data) => {
        console.log('socket off' + data);
      });
    };
  }, [fetchOneProduct]);

  return (
    <div>
      <div className="row" style={{ marginBottom: '10px' }}>
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
          <div className="card">
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
            <h1 style={{ fontSize: '1.2rem', marginBottom: 15 }}>
              Perkembangan Penjualan Produk {name}
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
            {data.length > 2 ? (
              <p
                style={{
                  fontSize: '1rem',
                  letterSpacing: '0.8px',
                  lineHeight: 1.2,
                }}
              >
                Analisis trend ini menggunakan metode
                <span style={{ fontStyle: 'italic' }}> least square</span>{' '}
                dimana data terbaru akan lebih relevan untuk menggambarkan data
                yang akan datang. Jumlah data sebelumnya yang digunakan sebanyak{' '}
                {data.length - 1} data, dimana{' '}
                {data.map((item, idx) =>
                  idx === data.length - 1
                    ? ''
                    : `data ke-${
                        idx + 1
                      } menunjukan penjualan produk sebanyak ${item.qty}buah, `,
                )}{' '}
                setelah dilakukan analisis dapat disimpulkan prediksi permintaan
                produk untuk bulan selanjutnya yaitu bulan{' '}
                <span style={{ fontWeight: 'bolder' }}>
                  {month} mengalami
                  {data[data.length - 2].qty < data[data.length - 1].qty
                    ? ' Kenaikan '
                    : ' Penurunan '}
                </span>{' '}
                dari bulan sebelumnya karena diprediksi akan mendapat permintaan
                sebanyak{' '}
                <span style={{ fontWeight: 'bolder' }}>
                  {data[data.length - 1].qty.toString()} buah.
                </span>
              </p>
            ) : (
              <h1 style={{ fontSize: '1.1rem', marginBottom: 15 }}>
                Data Masih Kosong
              </h1>
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
                <Table columns={trendProduct} data={trendData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendProduct;
