import {
  CustomersSection,
  type CustomerLogo,
} from '@/components/design/customers-section'

const customers: CustomerLogo[] = [
  {
    srcLight: '/customers/lomi_d.webp',
    srcDark: '/customers/lomi_l.webp',
    alt: 'lomi.',
    height: 32,
    width: 80,
  },
  {
    srcLight: '/customers/ledger_d.webp',
    srcDark: '/customers/ledger_l.webp',
    alt: 'The African Ledger',
    height: 40,
    width: 40,
  },
  {
    srcLight: '/customers/psychoroid.webp',
    srcDark: '/customers/psychoroid.webp',
    alt: 'psychoroid.com',
    height: 40,
    width: 40,
  },
]

export function LandingCustomers() {
  return <CustomersSection customers={customers} />
}
