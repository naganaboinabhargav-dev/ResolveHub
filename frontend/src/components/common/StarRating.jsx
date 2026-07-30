import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

// Interactive when onRate is provided, otherwise a read-only display.
const StarRating = ({ value = 0, onRate, size = 20 }) => {
  const [hover, setHover] = useState(0);
  const interactive = !!onRate;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onRate && onRate(n)}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <FiStar size={size} className={filled ? 'fill-amber-400 text-amber-400' : 'text-line'} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
