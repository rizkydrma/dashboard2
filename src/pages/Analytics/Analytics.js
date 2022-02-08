import React, { useState, useCallback } from 'react';

import Button from '../../elements/Button/Button';
import { getProducts } from '../../api/products';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faDiagnoses } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';

function Analytics() {
  const [products, setProducts] = useState([]);

  const handleClickProduct = () => {
    fetchProducts();
  };

  const fetchProducts = useCallback(async () => {
    let { data } = await getProducts();
    if (data.error) {
      console.log(data.error);
      return;
    }
    setProducts(data.data);
  }, []);

  useEffect(() => {}, [products]);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Analytics</h1>
      <div className="row">
        <div className="col-4">
          <Button type="link" href="/trendpenjualan">
            <div className="status-card">
              <div className="status-card__icon">
                <FontAwesomeIcon icon={faDiagnoses} />
              </div>
              <div className="status-card__info">Analisis Trend Penjualan </div>
            </div>
          </Button>
        </div>
        <div className="col-4">
          <div onClick={handleClickProduct}>
            <div className="status-card">
              <div className="status-card__icon">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className="status-card__info">Trend Produk </div>
            </div>
          </div>
        </div>
      </div>
      {products.length > 0 && (
        <div className="card">
          <h1 style={{ fontSize: '1.2rem', marginBottom: 15 }}>Pilih Produk</h1>
          <div className="row">
            {products.map((product) => (
              <div
                className="col-3"
                style={{ marginBottom: 15 }}
                key={product._id}
              >
                <Button
                  className="btn btn-theme btn-lg btn-block"
                  type="link"
                  href={`/trendproduct/${product.name}`}
                >
                  {product.name}
                </Button>
              </div>
            ))}
            <div className="col-12">
              <Button
                type="link"
                href="/topproducts"
                className="btn btn-lg btn-block btn-theme"
              >
                Top Products
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
