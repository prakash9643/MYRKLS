import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, LogOut, MapPin, Package, Plus, Trash2, UserRound } from 'lucide-react';
import { useShopifyCustomerAccount } from '../../context/ShopifyCustomerAccountContext';
import type { AddressInput, CustomerAddress, CustomerOrder, OrderPage } from '../../shopify/customer-account/types';
import { MyrklsFooter } from '../MyrklsFooter';
import { MyrklsHeader } from '../MyrklsHeader';

type AccountSection = 'overview' | 'orders' | 'addresses';

const EMPTY_ADDRESS: AddressInput = {
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  zoneCode: '',
  countryCode: 'IN',
  zip: '',
  phoneNumber: '',
};

const getRoute = (): { section: AccountSection; orderId: string | null } => {
  const parts = window.location.hash.replace(/^#/, '').split('/');
  if (parts[1] === 'orders' && parts[2]) {
    try {
      return { section: 'orders', orderId: decodeURIComponent(parts.slice(2).join('/')) };
    } catch {
      return { section: 'orders', orderId: null };
    }
  }
  if (parts[1] === 'orders') return { section: 'orders', orderId: null };
  if (parts[1] === 'addresses') return { section: 'addresses', orderId: null };
  return { section: 'overview', orderId: null };
};

const formatPrice = (amount: string, currency: string): string => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(numericAmount);
  } catch {
    return `${amount} ${currency}`;
  }
};

const formatDate = (date: string | null): string => {
  if (!date) return 'Date unavailable';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Date unavailable' : parsed.toLocaleDateString();
};

interface ShopifyCustomerAccountPageProps {
  onBackToStore: () => void;
  onNavigateViewAll: () => void;
  onNavigateProduct: (productId: string) => void;
}

export const ShopifyCustomerAccountPage: React.FC<ShopifyCustomerAccountPageProps> = ({
  onBackToStore,
  onNavigateViewAll,
  onNavigateProduct,
}) => {
  const {
    status,
    profile,
    error,
    signIn,
    signOut,
    loadOrders,
    loadOrder,
    updateProfileName,
    createAddress,
    updateAddress,
    removeAddress,
    makeAddressDefault,
  } = useShopifyCustomerAccount();
  const [route, setRoute] = useState(getRoute);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderPageInfo, setOrderPageInfo] = useState<OrderPage | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);
  const [addressDraft, setAddressDraft] = useState<AddressInput>(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressDefault, setAddressDefault] = useState(false);
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ firstName: '', lastName: '' });
  const [profileBusy, setProfileBusy] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || route.section !== 'orders' || route.orderId || ordersLoaded) return;
    setOrdersLoading(true);
    setOrdersError(null);
    void loadOrders(null)
      .then((page) => {
        setOrders(page.orders);
        setOrderPageInfo(page);
        setOrdersLoaded(true);
      })
      .catch((loadError: unknown) => {
        setOrdersError(loadError instanceof Error ? loadError.message : 'Could not load your orders.');
      })
      .finally(() => setOrdersLoading(false));
  }, [loadOrders, ordersLoaded, route.orderId, route.section, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !route.orderId) {
      setSelectedOrder(null);
      return;
    }
    let active = true;
    setSelectedOrderLoading(true);
    setActionError(null);
    void loadOrder(route.orderId)
      .then((order) => {
        if (active) setSelectedOrder(order);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setSelectedOrder(null);
          setActionError(loadError instanceof Error ? loadError.message : 'Could not load this order.');
        }
      })
      .finally(() => {
        if (active) setSelectedOrderLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadOrder, route.orderId, status]);

  const accountName = useMemo(
    () => [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.email || 'MYRKLS Member',
    [profile]
  );

  const navigateTo = (section: AccountSection): void => {
    window.location.hash = section === 'overview' ? '#account' : `#account/${section}`;
  };

  const openAddressForm = (address?: CustomerAddress): void => {
    setEditingAddressId(address?.id ?? null);
    setAddressDraft(address ? {
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      zoneCode: address.zoneCode || '',
      countryCode: address.countryCode,
      zip: address.zip || '',
      phoneNumber: address.phoneNumber || '',
    } : EMPTY_ADDRESS);
    setAddressDefault(address?.isDefault ?? (profile?.addresses.length === 0));
    setAddressError(null);
    setAddressFormOpen(true);
  };

  const submitAddress = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setAddressBusy(true);
    setAddressError(null);
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressDraft, addressDefault);
      } else {
        await createAddress(addressDraft, addressDefault || profile?.addresses.length === 0);
      }
      setAddressFormOpen(false);
      setEditingAddressId(null);
    } catch (saveError) {
      setAddressError(saveError instanceof Error ? saveError.message : 'Shopify could not save this address.');
    } finally {
      setAddressBusy(false);
    }
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setProfileBusy(true);
    setActionError(null);
    try {
      await updateProfileName(profileDraft.firstName, profileDraft.lastName);
      setProfileFormOpen(false);
    } catch (profileError) {
      setActionError(profileError instanceof Error ? profileError.message : 'Shopify could not update your profile.');
    } finally {
      setProfileBusy(false);
    }
  };

  const deleteAddress = async (address: CustomerAddress): Promise<void> => {
    if (address.isDefault) {
      setActionError('Choose another default address before deleting this address.');
      return;
    }
    if (!window.confirm('Delete this saved address from your Shopify account?')) return;
    setActionError(null);
    try {
      await removeAddress(address);
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : 'Shopify could not delete this address.');
    }
  };

  const loadNextOrdersPage = async (): Promise<void> => {
    if (!orderPageInfo?.hasNextPage || !orderPageInfo.endCursor) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const nextPage = await loadOrders(orderPageInfo.endCursor);
      setOrders((current) => [...current, ...nextPage.orders]);
      setOrderPageInfo(nextPage);
    } catch (loadError) {
      setOrdersError(loadError instanceof Error ? loadError.message : 'Could not load more orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrder = (order: CustomerOrder): void => {
    window.location.hash = `#account/orders/${encodeURIComponent(order.id)}`;
  };

  const renderOrder = (order: CustomerOrder): React.ReactNode => (
    <article key={order.id} className="border border-[#E5E0D8] bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#777777]">{formatDate(order.processedAt)}</p>
          <h3 className="mt-2 font-['Syne',sans-serif] text-lg font-bold uppercase text-[#133429]">{order.name}</h3>
          <p className="mt-1 text-sm text-[#666666]">{formatPrice(order.totalAmount, order.currencyCode)}</p>
        </div>
        <button
          type="button"
          onClick={() => openOrder(order)}
          className="inline-flex items-center gap-2 self-start border border-[#133429] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#133429] transition-colors hover:bg-[#133429] hover:text-white sm:self-auto"
        >
          Order details <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );

  const renderOrderDetails = (order: CustomerOrder): React.ReactNode => (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigateTo('orders')}
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#526258] hover:text-[#FF5A1F]"
      >
        <ArrowLeft size={14} /> Back to orders
      </button>
      <section className="border border-[#E5E0D8] bg-white p-5 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-[#EAE6DF] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#777777]">Order placed {formatDate(order.processedAt)}</p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-2xl font-bold uppercase text-[#133429]">{order.name}</h2>
          </div>
          <a
            href={order.statusUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start text-[10px] font-bold uppercase tracking-[0.13em] text-[#FF5A1F]"
          >
            Shopify order status <ArrowRight size={14} />
          </a>
        </div>
        <div className="divide-y divide-[#EEEAE4]">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-5">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.imageAlt || item.name} className="h-20 w-16 bg-[#F4F1EA] object-cover" />
              ) : (
                <div className="flex h-20 w-16 items-center justify-center bg-[#F4F1EA] text-[#9A968F]"><Package size={20} /></div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#133429]">{item.name}</h3>
                {item.variantTitle && <p className="mt-1 text-xs text-[#777777]">{item.variantTitle}</p>}
                <p className="mt-1 text-xs text-[#777777]">Qty {item.quantity}</p>
              </div>
              {item.totalAmount && item.currencyCode && (
                <p className="text-sm font-semibold text-[#333333]">{formatPrice(item.totalAmount, item.currencyCode)}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-[#EAE6DF] pt-5 text-sm font-bold text-[#133429]">
          <span>Order total</span><span>{formatPrice(order.totalAmount, order.currencyCode)}</span>
        </div>
        {order.tracking.length > 0 && (
          <div className="mt-7 border-t border-[#EAE6DF] pt-5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#526258]">Shipment tracking</h3>
            <div className="mt-3 space-y-3">
              {order.tracking.map((tracking, index) => (
                <div key={`${tracking.number || tracking.company || 'tracking'}-${index}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{tracking.company || 'Carrier'}{tracking.number ? ` · ${tracking.number}` : ''}</span>
                  {tracking.url && <a className="font-semibold text-[#FF5A1F]" href={tracking.url} target="_blank" rel="noreferrer">Track shipment</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F7] text-[#111111]">
      <MyrklsHeader
        onNavigateHome={onBackToStore}
        onNavigateViewAll={onNavigateViewAll}
        onNavigateProduct={onNavigateProduct}
        onNavigateAccount={() => navigateTo('overview')}
      />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-10 sm:px-7 sm:py-16">
        <button
          type="button"
          onClick={onBackToStore}
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#526258] hover:text-[#FF5A1F]"
        >
          <ArrowLeft size={14} /> Continue shopping
        </button>

        {status === 'loading' && (
          <section className="mx-auto max-w-xl border border-[#E5E0D8] bg-white px-6 py-16 text-center">
            <LoaderCircle className="mx-auto animate-spin text-[#FF5A1F]" size={28} />
            <h1 className="mt-5 font-['Syne',sans-serif] text-xl font-bold uppercase text-[#133429]">Connecting your Shopify account</h1>
            <p className="mt-3 text-sm text-[#666666]">Please wait while we securely verify your session.</p>
          </section>
        )}

        {(status === 'unconfigured' || status === 'error' || status === 'signed-out') && (
          <section className="mx-auto max-w-xl border border-[#E5E0D8] bg-white px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#E5E0D8] text-[#FF5A1F]">
              <UserRound size={23} />
            </div>
            <h1 className="mt-6 font-['Syne',sans-serif] text-2xl font-bold uppercase text-[#133429]">
              {status === 'unconfigured' ? 'Account sign-in setup required' : 'Your MYRKLS account'}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#666666]">
              {status === 'unconfigured'
                ? 'Shopify Customer Accounts are not configured for this storefront yet.'
                : 'Sign in through Shopify to securely view your profile, orders and saved delivery addresses.'}
            </p>
            {(error || status === 'unconfigured') && (
              <p role="status" className="mt-5 border border-[#E8D8C9] bg-[#FAF6F1] p-4 text-left text-xs leading-5 text-[#6D5140]">
                {error || 'Set VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID and VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI, then register the exact redirect URI and storefront origin in Shopify Admin.'}
              </p>
            )}
            {status === 'signed-out' && (
              <button
                type="button"
                onClick={() => void signIn().catch((signInError: unknown) => setActionError(
                  signInError instanceof Error ? signInError.message : 'Could not start Shopify sign-in.'
                ))}
                className="mt-7 inline-flex items-center justify-center gap-3 bg-[#133429] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#FF5A1F]"
              >
                Sign in with Shopify <ArrowRight size={14} />
              </button>
            )}
          </section>
        )}

        {status === 'authenticated' && profile && (
          <div>
            <div className="flex flex-col gap-5 border-b border-[#E5E0D8] pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777777]">MYRKLS / Customer account</p>
                <h1 className="mt-2 font-['Syne',sans-serif] text-3xl font-bold uppercase text-[#133429] sm:text-4xl">{accountName}</h1>
                {profile.email && <p className="mt-2 text-sm text-[#666666]">{profile.email}</p>}
              </div>
              <button
                type="button"
                onClick={() => void signOut().catch((signOutError: unknown) => setActionError(
                  signOutError instanceof Error ? signOutError.message : 'Could not complete Shopify sign-out.'
                ))}
                className="inline-flex items-center gap-2 self-start border border-[#D8D2C9] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#526258] hover:border-[#FF5A1F] hover:text-[#FF5A1F] sm:self-auto"
              >
                Sign out <LogOut size={14} />
              </button>
            </div>

            <nav aria-label="Account navigation" className="mt-6 flex flex-wrap gap-2 border-b border-[#E5E0D8] pb-5">
              {([
                ['overview', 'Overview'],
                ['orders', 'Orders'],
                ['addresses', 'Addresses'],
              ] as const).map(([section, label]) => (
                <button
                  type="button"
                  key={section}
                  onClick={() => navigateTo(section)}
                  aria-current={route.section === section ? 'page' : undefined}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    route.section === section ? 'bg-[#133429] text-white' : 'bg-white text-[#526258] hover:text-[#FF5A1F]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {(error || actionError) && (
              <p role="alert" className="mt-6 border border-[#E8D8C9] bg-[#FAF6F1] p-4 text-sm text-[#6D5140]">{error || actionError}</p>
            )}

            {route.section === 'overview' && (
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <button onClick={() => navigateTo('orders')} className="border border-[#E5E0D8] bg-white p-7 text-left transition-colors hover:border-[#133429]">
                  <Package className="text-[#FF5A1F]" size={22} />
                  <h2 className="mt-5 font-['Syne',sans-serif] text-xl font-bold uppercase text-[#133429]">Order history</h2>
                  <p className="mt-2 text-sm text-[#666666]">View order details, fulfillment status and available tracking.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#FF5A1F]">View orders <ArrowRight size={14} /></span>
                </button>
                <button onClick={() => navigateTo('addresses')} className="border border-[#E5E0D8] bg-white p-7 text-left transition-colors hover:border-[#133429]">
                  <MapPin className="text-[#FF5A1F]" size={22} />
                  <h2 className="mt-5 font-['Syne',sans-serif] text-xl font-bold uppercase text-[#133429]">Saved addresses</h2>
                  <p className="mt-2 text-sm text-[#666666]">{profile.addresses.length} Shopify address{profile.addresses.length === 1 ? '' : 'es'} on your account.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#FF5A1F]">Manage addresses <ArrowRight size={14} /></span>
                </button>
                <section className="border border-[#E5E0D8] bg-white p-7 md:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-['Syne',sans-serif] text-lg font-bold uppercase text-[#133429]">Profile details</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDraft({ firstName: profile.firstName || '', lastName: profile.lastName || '' });
                        setActionError(null);
                        setProfileFormOpen((open) => !open);
                      }}
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF5A1F]"
                    >
                      {profileFormOpen ? 'Cancel' : 'Edit name'}
                    </button>
                  </div>
                  {profileFormOpen && (
                    <form onSubmit={(event) => void submitProfile(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="text-xs font-semibold text-[#526258]">
                        First name
                        <input
                          value={profileDraft.firstName}
                          onChange={(event) => setProfileDraft((current) => ({ ...current, firstName: event.target.value }))}
                          maxLength={255}
                          className="mt-2 w-full border border-[#D8D2C9] bg-[#FAF9F7] px-3 py-3 text-sm text-[#222222] outline-none focus:border-[#133429]"
                        />
                      </label>
                      <label className="text-xs font-semibold text-[#526258]">
                        Last name
                        <input
                          value={profileDraft.lastName}
                          onChange={(event) => setProfileDraft((current) => ({ ...current, lastName: event.target.value }))}
                          maxLength={255}
                          className="mt-2 w-full border border-[#D8D2C9] bg-[#FAF9F7] px-3 py-3 text-sm text-[#222222] outline-none focus:border-[#133429]"
                        />
                      </label>
                      <div className="sm:col-span-2">
                        <button type="submit" disabled={profileBusy} className="inline-flex items-center gap-2 bg-[#133429] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50">
                          {profileBusy && <LoaderCircle size={14} className="animate-spin" />}
                          Save name
                        </button>
                      </div>
                    </form>
                  )}
                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <div><dt className="text-xs text-[#777777]">Name</dt><dd className="mt-1 font-medium">{accountName}</dd></div>
                    <div><dt className="text-xs text-[#777777]">Email</dt><dd className="mt-1 font-medium">{profile.email || 'Not provided'}</dd></div>
                    <div><dt className="text-xs text-[#777777]">Phone</dt><dd className="mt-1 font-medium">{profile.phone || 'Not provided'}</dd></div>
                    <div><dt className="text-xs text-[#777777]">Customer since</dt><dd className="mt-1 font-medium">{formatDate(profile.creationDate)}</dd></div>
                  </dl>
                  <p className="mt-5 text-xs leading-5 text-[#777777]">Email and phone are managed by Shopify Customer Accounts and are displayed read-only here.</p>
                </section>
              </div>
            )}

            {route.section === 'orders' && (
              <section className="mt-7 space-y-4">
                {route.orderId ? (
                  selectedOrderLoading ? (
                    <p className="flex items-center gap-3 py-10 text-sm text-[#666666]"><LoaderCircle size={18} className="animate-spin" /> Loading order details…</p>
                  ) : selectedOrder ? renderOrderDetails(selectedOrder) : (
                    <div className="border border-[#E5E0D8] bg-white p-7 text-sm text-[#666666]">This order was not found in your Shopify account.</div>
                  )
                ) : ordersLoading && orders.length === 0 ? (
                  <p className="flex items-center gap-3 py-10 text-sm text-[#666666]"><LoaderCircle size={18} className="animate-spin" /> Loading your orders…</p>
                ) : ordersError ? (
                  <p role="alert" className="border border-[#E8D8C9] bg-[#FAF6F1] p-5 text-sm text-[#6D5140]">{ordersError}</p>
                ) : orders.length > 0 ? (
                  <>
                    {orders.map(renderOrder)}
                    {orderPageInfo?.hasNextPage && (
                      <button
                        type="button"
                        disabled={ordersLoading}
                        onClick={() => void loadNextOrdersPage()}
                        className="inline-flex items-center gap-2 border border-[#133429] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#133429] disabled:opacity-50"
                      >
                        {ordersLoading && <LoaderCircle size={14} className="animate-spin" />}
                        Load more orders
                      </button>
                    )}
                  </>
                ) : (
                  <div className="border border-[#E5E0D8] bg-white px-6 py-12 text-center">
                    <Package className="mx-auto text-[#A59E94]" size={24} />
                    <h2 className="mt-4 font-['Syne',sans-serif] font-bold uppercase text-[#133429]">No orders yet</h2>
                    <p className="mt-2 text-sm text-[#666666]">Shopify orders placed with this customer account will appear here.</p>
                    <button type="button" onClick={onNavigateViewAll} className="mt-5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#FF5A1F]">Explore products</button>
                  </div>
                )}
              </section>
            )}

            {route.section === 'addresses' && (
              <section className="mt-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-['Syne',sans-serif] text-xl font-bold uppercase text-[#133429]">Saved addresses</h2>
                    <p className="mt-1 text-sm text-[#666666]">Address changes are saved directly to your Shopify customer account.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddressForm()}
                    className="inline-flex items-center gap-2 bg-[#133429] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-white hover:bg-[#FF5A1F]"
                  >
                    <Plus size={14} /> Add address
                  </button>
                </div>

                {addressFormOpen && (
                  <form onSubmit={(event) => void submitAddress(event)} className="mb-6 border border-[#E5E0D8] bg-white p-5 sm:p-7">
                    <h3 className="font-['Syne',sans-serif] text-lg font-bold uppercase text-[#133429]">{editingAddressId ? 'Edit address' : 'Add address'}</h3>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {([
                        ['firstName', 'First name', true],
                        ['lastName', 'Last name', true],
                        ['address1', 'Address line 1', true],
                        ['address2', 'Address line 2', false],
                        ['city', 'City', true],
                        ['zoneCode', 'State / region code', false],
                        ['countryCode', 'Country code (ISO)', true],
                        ['zip', 'Postal code', true],
                        ['phoneNumber', 'Phone number', false],
                      ] as const).map(([key, label, required]) => (
                        <label key={key} className="block text-xs font-semibold text-[#526258]">
                          {label}
                          <input
                            value={addressDraft[key]}
                            onChange={(event) => setAddressDraft((current) => ({ ...current, [key]: event.target.value }))}
                            required={required}
                            maxLength={key === 'countryCode' ? 2 : 256}
                            autoComplete={key === 'firstName' ? 'given-name' : key === 'lastName' ? 'family-name' : undefined}
                            className="mt-2 w-full border border-[#D8D2C9] bg-[#FAF9F7] px-3 py-3 text-sm text-[#222222] outline-none focus:border-[#133429]"
                          />
                        </label>
                      ))}
                    </div>
                    <label className="mt-5 flex items-center gap-3 text-sm text-[#526258]">
                      <input type="checkbox" checked={addressDefault} onChange={(event) => setAddressDefault(event.target.checked)} />
                      Set as default address
                    </label>
                    {addressError && <p role="alert" className="mt-4 text-sm text-[#A33B24]">{addressError}</p>}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button type="submit" disabled={addressBusy} className="inline-flex items-center gap-2 bg-[#133429] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50">
                        {addressBusy && <LoaderCircle size={14} className="animate-spin" />}
                        Save address
                      </button>
                      <button type="button" onClick={() => setAddressFormOpen(false)} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#666666]">Cancel</button>
                    </div>
                  </form>
                )}

                {profile.addresses.length === 0 ? (
                  <div className="border border-[#E5E0D8] bg-white px-6 py-12 text-center text-sm text-[#666666]">
                    <MapPin className="mx-auto text-[#A59E94]" size={24} />
                    <p className="mt-4">No saved addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {profile.addresses.map((address) => (
                      <article key={address.id} className="border border-[#E5E0D8] bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-[#133429]">{[address.firstName, address.lastName].filter(Boolean).join(' ')}</h3>
                            {address.isDefault && <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#FF5A1F]"><Check size={12} /> Default address</p>}
                          </div>
                          <button type="button" title={address.isDefault ? 'Choose another default address before deleting this address' : 'Delete address'} disabled={address.isDefault} onClick={() => void deleteAddress(address)} className="p-2 text-[#8A837A] hover:text-[#A33B24] disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={16} /></button>
                        </div>
                        <address className="mt-4 whitespace-pre-line text-sm not-italic leading-6 text-[#666666]">
                          {[address.address1, address.address2, [address.city, address.zoneCode, address.zip].filter(Boolean).join(', '), address.countryCode, address.phoneNumber].filter(Boolean).join('\n')}
                        </address>
                        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#EEEAE4] pt-4">
                          <button type="button" onClick={() => openAddressForm(address)} className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#526258] hover:text-[#FF5A1F]">Edit</button>
                          {!address.isDefault && <button type="button" onClick={() => void makeAddressDefault(address).catch((saveError: unknown) => setActionError(saveError instanceof Error ? saveError.message : 'Could not update the default address.'))} className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#526258] hover:text-[#FF5A1F]">Make default</button>}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
      <MyrklsFooter onNavigateViewAll={onNavigateViewAll} onNavigateHome={onBackToStore} />
    </div>
  );
};
