// src/components/common/FloatingChatButton.js

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './FloatingChatButton.css';
function FloatingChatButton() {
    return (
        <a
            href="https://wa.me/7397746644"
            className="floating-chat"

            target="_blank"
            rel="noopener noreferrer"
        >
            <FaWhatsapp size={38} />
        </a>
    );
}

export default FloatingChatButton;
