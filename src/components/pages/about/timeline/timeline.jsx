import clsx from 'clsx';
import Image from 'next/image';
import PropTypes from 'prop-types';

import Container from 'components/shared/container';
import lineMobile from 'images/pages/about/timeline/line-mobile.svg';
import lineTablet from 'images/pages/about/timeline/line-tablet.svg';
import line from 'images/pages/about/timeline/line.svg';
import pointerLineLg from 'images/pages/about/timeline/pointer-line-lg.svg';

const ITEMS = [
  {
    date: 'February, 2022',
    title: 'Limited Preview',
  },
  {
    className: 'translate-x-2 lg:-translate-x-1',
    date: 'June 15th, 2022',
    title: 'Technical Preview',
  },
  {
    className: 'lg:-translate-x-5',
    date: 'December 6th, 2022',
    title: "Neon's Free Tier",
  },
  {
    className: 'translate-x-1 lg:-translate-x-11',
    date: 'Q1 of 2023',
    title: 'Paid plans launch',
  },
  {
    className: '2xl:-translate-x-1 lg:translate-x-[-60px]',
    date: 'April 15th, 2024',
    title: 'Neon is Generally Available',
  },
];

const Point = ({ align, size = 'md' }) => (
  <span
    className={clsx(
      'absolute left-0 h-8 w-[7px] md:-left-1.5 md:bottom-auto md:top-[-9px] md:-rotate-90 ',
      align === 'bottom' ? '-bottom-1 rotate-180' : '-top-1'
    )}
    aria-hidden
  >
    <span
      className={clsx(
        'absolute left-1/2 top-[3px] flex h-3.5 w-3.5  -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#00D7E5]',
        size === 'md' ? 'opacity-40 blur-[9px]' : 'opacity-90 blur-[2px]'
      )}
    />
    {size === 'md' ? (
      <span className="absolute bottom-0 left-1/2 h-7 w-px -translate-x-1/2 bg-gradient-to-t from-transparent from-[7%] to-[#97FFE0]" />
    ) : (
      <Image
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rotate-180"
        src={pointerLineLg}
        width={4}
        height={29}
        alt=""
      />
    )}
    <span
      className={clsx(
        'absolute rounded-full border border-gray-new-8 shadow-[0px_1px_4px_0px_rgba(0,0,0,.8)]',
        {
          'left-0 top-0 h-2 w-2 bg-[radial-gradient(69%_69%_at_31%_38%,_#9FEEFF_31%,_#1A5A5E_86%)]':
            size === 'md',
          '-left-[3px] -top-[3px] h-3 w-3 bg-[radial-gradient(81%_81%_at_40%_58%,_#9FEEFF_31%,_#1A5A5E_86%)]':
            size === 'lg',
        }
      )}
    />
    {size === 'lg' && (
      <span className="absolute -left-px top-px h-[5px] w-[5px] rounded-full bg-[linear-gradient(128deg,#9FFFFF_12.5%,#2B869A_91.75%)] mix-blend-plus-lighter blur-[2px]" />
    )}
  </span>
);

Point.propTypes = {
  align: PropTypes.oneOf(['top', 'bottom']),
  size: PropTypes.oneOf(['md', 'lg']),
};

const Timeline = () => (
  <section className="timeline safe-paddings mt-40 overflow-hidden pt-10 xl:mt-24 lg:mt-16 md:mt-4">
    <Container className="relative 2xl:max-w-5xl" size="1344">
      <span className="pointer-events-none absolute -top-9 left-1/2 h-[230px] w-[365px] translate-x-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,#09212A_0%,#071119_48%,rgba(7,17,25,0)_100%)] 2xl:h-[218px] 2xl:w-[352px] 2xl:translate-x-[27%] lg:-top-5 lg:h-[170px] lg:w-[272px] lg:translate-x-[10%] md:-bottom-2 md:-left-14 md:top-auto md:h-[170px] md:w-[270px] md:translate-x-0" />
      <Image
        className="pointer-events-none absolute left-1/2 top-[104px] -translate-x-1/2 2xl:w-[960px] lg:hidden"
        src={line}
        width={1344}
        height={2}
        alt=""
      />
      <Image
        className="pointer-events-none absolute left-1/2 top-[93px] hidden w-[704px] -translate-x-1/2 lg:block md:hidden"
        src={lineTablet}
        width={704}
        height={2}
        alt=""
      />
      <Image
        className="pointer-events-none absolute left-[52px] top-1/2 hidden w-0.5 -translate-y-1/2 md:block"
        src={lineMobile}
        width={2}
        height={440}
        alt=""
      />
      <ul className="relative z-10 mx-auto flex h-[178px] justify-between px-[92px] pt-8 2xl:pl-16 2xl:pr-0 lg:h-[161px] lg:max-w-[704px] lg:pl-[51px] lg:pt-7 md:h-auto md:flex-col md:gap-y-10 md:pb-11 md:pt-[49px]">
        {ITEMS.map(({ date, title, className }, index) => (
          <li
            className={clsx(
              'relative flex h-fit flex-col gap-y-2 lg:gap-y-1 md:translate-x-0 md:pl-3.5',
              index % 2 === 1 ? 'mt-auto pt-7 md:pt-0' : 'pb-7 md:pb-0',
              className
            )}
            key={index}
          >
            <span
              className={clsx(
                'whitespace-nowrap text-sm font-light leading-none md:text-[13px]',
                index === ITEMS.length - 1 ? 'text-gray-new-80' : 'text-gray-new-60'
              )}
            >
              {date}
            </span>
            <span className="whitespace-nowrap text-lg font-medium leading-tight tracking-extra-tight text-gray-new-90 lg:text-base">
              {title}
            </span>
            <Point
              align={index % 2 === 0 ? 'bottom' : 'top'}
              size={index === ITEMS.length - 1 ? 'lg' : 'md'}
            />
          </li>
        ))}
      </ul>
    </Container>
  </section>
);

export default Timeline;
