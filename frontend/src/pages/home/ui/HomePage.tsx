import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { LoginForm } from '@/features/auth';
import { CreateServiceForm } from '@/features/create-service';
import { Header } from '@/widgets/header';
import { MyServiceList } from '@/widgets/my-service-list';
import { OrderList } from '@/widgets/order-list';
import { ServiceList } from '@/widgets/service-list';

export function HomePage() {
  const { user } = useAuth();
  const [servicesRefreshKey, setServicesRefreshKey] = useState(0);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  return (
    <>
      <Header />
      <main className="main">
        {!user && (
          <section>
            <LoginForm />
          </section>
        )}
        {user?.role === 'performer' && (
          <>
            <section className="section-create-service">
              <CreateServiceForm onSuccess={() => setServicesRefreshKey((k) => k + 1)} />
            </section>
            <section>
              <h2>Мои услуги</h2>
              <MyServiceList refreshKey={servicesRefreshKey} />
            </section>
          </>
        )}
        <section>
          <h2>Услуги</h2>
          <ServiceList
            refreshKey={servicesRefreshKey}
            onOrderCreated={() => setOrdersRefreshKey((k) => k + 1)}
          />
        </section>
        {user && (
          <section>
            <h2>Мои заказы</h2>
            <OrderList
              refreshKey={ordersRefreshKey}
              onOrderUpdated={() => setOrdersRefreshKey((k) => k + 1)}
            />
          </section>
        )}
      </main>
    </>
  );
}
