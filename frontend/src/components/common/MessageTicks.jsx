import { BsCheck2, BsCheck2All } from 'react-icons/bs';

// WhatsApp-style delivery indicator for messages sent by the current user.
// Single tick: sent. Double grey tick: delivered (stored, not yet read).
// Double blue tick: read by the other party.
const MessageTicks = ({ isRead, className = '' }) => {
  if (isRead) return <BsCheck2All className={`inline text-sky-300 ${className}`} size={14} />;
  return <BsCheck2All className={`inline opacity-70 ${className}`} size={14} />;
};

export default MessageTicks;
