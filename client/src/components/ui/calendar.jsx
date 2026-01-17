'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
} & {
  buttonVariant?['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl,
        String.raw`rtl,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown) =>
          date.toLocaleString('default', { month),
        ...formatters,
      }}
      classNames={{
        root, defaultClassNames.root),
        months,
          defaultClassNames.months,
        ),
        month, defaultClassNames.month),
        nav,
          defaultClassNames.nav,
        ),
        button_previous),
          'size-(--cell-size) aria-disabled,
          defaultClassNames.button_previous,
        ),
        button_next),
          'size-(--cell-size) aria-disabled,
          defaultClassNames.button_next,
        ),
        month_caption) w-full px-(--cell-size)',
          defaultClassNames.month_caption,
        ),
        dropdowns) gap-1.5',
          defaultClassNames.dropdowns,
        ),
        dropdown_root,
          defaultClassNames.dropdown_root,
        ),
        dropdown,
          defaultClassNames.dropdown,
        ),
        caption_label,
          captionLayout === 'label'
            ? 'text-sm'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        table,
        weekdays, defaultClassNames.weekdays),
        weekday,
          defaultClassNames.weekday,
        ),
        week, defaultClassNames.week),
        week_number_header)',
          defaultClassNames.week_number_header,
        ),
        week_number,
          defaultClassNames.week_number,
        ),
        day=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none',
          defaultClassNames.day,
        ),
        range_start,
          defaultClassNames.range_start,
        ),
        range_middle, defaultClassNames.range_middle),
        range_end, defaultClassNames.range_end),
        today=true]:rounded-none',
          defaultClassNames.today,
        ),
        outside,
          defaultClassNames.outside,
        ),
        disabled,
          defaultClassNames.disabled,
        ),
        hidden, defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          )
        },
        DayButton,
        WeekNumber, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day=true]/day) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day=true]/day=true]/day=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
