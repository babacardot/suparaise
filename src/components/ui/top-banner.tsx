import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface TopBannerProps {
  breadcrumbs?: Array<{
    label: string
    href?: string
    isCurrentPage?: boolean
  }>
}

export function TopBanner({ breadcrumbs }: TopBannerProps) {
  // Default breadcrumbs if none provided
  const defaultBreadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Overview', isCurrentPage: true },
  ]

  const items = breadcrumbs || defaultBreadcrumbs

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center gap-0.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <BreadcrumbSeparator className="hidden md:block mx-2 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:relative [&>svg]:top-[1px] [&>svg]:-left-[4px]" />
            )}
            <BreadcrumbItem className="hidden md:block">
              {item.isCurrentPage ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href || '#'}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
