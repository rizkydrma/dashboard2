import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faSearch,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import QrReader from 'react-qr-reader';
import { useForm } from 'react-hook-form';

import { fetchOrders } from '../../redux/Orders/actions';
import StatusCard from '../../components/status-card/StatusCard';
import Button from '../../elements/Button/Button';
import Modal from '../../elements/Modal/Modal';
import ListPayment from '../../components/list-payment/ListPayment';
import { formatRupiah } from '../../utils/utility';
import { getOrdersByID, updateStatusPaymentsByID } from '../../api/orders';

const statusList = {
  idle: 'idle',
  proccess: 'proccess',
  success: 'success',
  error: 'error',
};

const rules = {
  id: {
    required: {
      value: true,
      message: 'id customer harus di isi!',
    },
  },
};

function Payments() {
  const dispatch = useDispatch();
  let orders = useSelector((state) => state.orders);
  const [qrscan, setQrscan] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState(statusList.idle);
  const [order, setOrder] = useState([]);
  const [progress, setProgress] = useState({});
  const [cash, setCash] = useState(0);
  const [waiting, setWaiting] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const handleScan = (data) => {
    if (data) {
      setQrscan(data);
    }
  };
  const handleError = (err) => {
    console.error(err);
  };

  const handleCash = (value) => {
    setCash(value);
  };

  const onSubmit = async ({ id }) => {
    setStatus(statusList.proccess);

    const { data } = await getOrdersByID(id);
    if (data.error) {
      setError('id', {
        message: data.message,
      });
      setStatus(statusList.error);
      return;
    }
    let waitingPayment = data.filter(
      (value) => value.status_payment !== 'done',
    );

    if (waitingPayment.length < 1) {
      setWaiting('Semua Orderan Sudah Dibayarkan!');
      return;
    }

    let totalWaitingPayment = waitingPayment
      .map((order) => {
        return order.order_items.reduce(
          (acc, curr) => acc + curr.price * curr.qty,
          0,
        );
      })
      .reduce((acc, curr) => acc + curr);
    setProgress({
      subTotal: totalWaitingPayment,
      tax: totalWaitingPayment * 0.1,
      grandTotal: totalWaitingPayment + totalWaitingPayment * 0.1,
      kembalian: (totalWaitingPayment + totalWaitingPayment * 0.1) * -1,
    });
    setOrder(data.filter((value) => value.status_payment !== 'done'));
    setStatus(statusList.success);
  };

  const handlePayments = async (id) => {
    let orders = await updateStatusPaymentsByID(id);

    if (orders.error) {
      console.log(orders.error);
      return;
    }

    setOrder([]);
    setProgress({});
    setCash(0);
  };

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch, orders.currentPage]);

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Payments</h1>
      <div className="row">
        <div className="col-3 col-md-6 col-sm-12">
          <StatusCard
            icon="bx bx-cart"
            count={orders.totalItems}
            title="Total Orders"
          />
        </div>
        <div className="col-3 col-md-6 col-sm-12">
          <StatusCard
            icon="bx bx-cart"
            count={
              orders.fullData.filter(
                (data) => data.status_payment === 'waiting_payment',
              ).length
            }
            title="Waiting"
            color="orange"
          />
        </div>
        <div className="col-3 col-md-6 col-sm-12">
          <StatusCard
            icon="bx bx-cart"
            count={
              orders.fullData.filter((data) => data.status_payment === 'done')
                .length
            }
            title="Done"
            color="green"
          />
        </div>
      </div>
      <div className="card">
        <div className="row">
          <div className="col-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="input input-id">
                <input
                  type="text"
                  name="id"
                  ref={register(rules.id)}
                  value={qrscan}
                  placeholder="input id customer..."
                  onChange={(e) => setQrscan(e.target.value)}
                />
                <Button submit className="btn btn-theme d-flex">
                  <FontAwesomeIcon icon={faSearch} />
                  Search
                </Button>
                <div className="qr-code" onClick={() => setShow(true)}>
                  <FontAwesomeIcon icon={faQrcode} />
                </div>
              </div>
              {errors.id && <span className="error">*{errors.id.message}</span>}
            </form>

            {waiting === null ? (
              order && <ListPayment items={order} status={status} />
            ) : (
              <span>{waiting}</span>
            )}
          </div>
          {order.length > 0 && (
            <div className="col-7">
              <div className="row">
                <div className="col-6 col-sm-12">
                  <div className="input">
                    <input
                      type="text"
                      name="nama"
                      disabled
                      value={order[0].user.full_name}
                    />
                    <label htmlFor="nama">Mr/Mrs</label>
                  </div>
                </div>
                <div className="col-6 col-sm-12">
                  <div className="input">
                    <input
                      type="text"
                      name="email"
                      disabled
                      value={order[0].user.email}
                    />
                    <label htmlFor="email">Email</label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <div className="input">
                    <input
                      type="text"
                      disabled
                      value={formatRupiah(progress.subTotal)}
                    />
                    <label htmlFor="subTotal">SubTotal (Rp)</label>
                  </div>
                </div>
                <div className="col-6">
                  <div className="input">
                    <input
                      type="text"
                      name="salesTax"
                      disabled
                      value={formatRupiah(progress.tax)}
                    />
                    <label htmlFor="salesTax">Sales Tax (Rp)</label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <div className="input">
                    <input
                      type="text"
                      name="grandTotal"
                      disabled
                      value={formatRupiah(progress.grandTotal)}
                    />
                    <label htmlFor="grandTotal">GrandTotal</label>
                  </div>
                </div>
                <div className="col-6">
                  <div className="input">
                    <input
                      type="text"
                      name="cash"
                      onChange={(e) => handleCash(e.target.value)}
                    />
                    <label htmlFor="cash">Uang DiTerima</label>
                  </div>
                </div>
                <div className="col-6"></div>
                <div className="col-6">
                  <div className="input">
                    <input
                      type="text"
                      name="kembalian"
                      disabled
                      value={+cash + +progress.kembalian}
                    />
                    <label htmlFor="kembalian">Kembalian</label>
                  </div>
                </div>
                {order.length > 0 && (
                  <div className="col-12">
                    <Button
                      className="btn btn-theme btn-block"
                      onClick={() => handlePayments(order[0].user._id)}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} /> Proccess Order
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal show={show} onClose={() => setShow(false)} title="Scan Barqode">
        <div className="d-flex">
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ height: 300, width: 300 }}
          />
          <textarea
            name="qrscan"
            id="qrscan"
            cols="35"
            rows="18"
            style={{ marginLeft: 15 }}
            value={qrscan}
            onChange={(e) => setQrscan(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}

export default Payments;
