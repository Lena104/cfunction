// Google Sheets 조건부 함수 가이드 - 인터랙티브 기능

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupSearch();
    setupCopyButtons();
    setupGridInteractions();
    setupSmoothScrolling();
    setupNavigationHighlight();
    addLoadingAnimations();
}

// 검색 기능
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(e.target.value);
        }
    });
}

function performSearch(query) {
    // 이전 하이라이트 제거
    clearHighlights();
    
    if (!query.trim()) {
        showAllSections();
        return;
    }

    const searchTerm = query.toLowerCase();
    const sections = document.querySelectorAll('.section');
    let hasResults = false;

    sections.forEach(section => {
        const content = section.textContent.toLowerCase();
        const hasMatch = content.includes(searchTerm);

        if (hasMatch) {
            section.style.display = 'block';
            highlightText(section, query);
            hasResults = true;
        } else {
            section.style.display = 'none';
        }
    });

    if (!hasResults) {
        showNoResults();
    } else {
        hideNoResults();
    }
}

function highlightText(element, query) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;

    while (node = walker.nextNode()) {
        if (node.nodeValue.trim()) {
            textNodes.push(node);
        }
    }

    textNodes.forEach(textNode => {
        const text = textNode.nodeValue;
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedText = text.replace(regex, '<span class="highlight">$1</span>');
            const span = document.createElement('span');
            span.innerHTML = highlightedText;
            textNode.parentNode.replaceChild(span, textNode);
        }
    });
}

function clearHighlights() {
    const highlights = document.querySelectorAll('.highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

function showAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'block';
    });
    hideNoResults();
}

function showNoResults() {
    let noResultsDiv = document.getElementById('noResults');
    if (!noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.id = 'noResults';
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <div class="no-results-content">
                <h3>🔍 검색 결과가 없습니다</h3>
                <p>다른 키워드로 검색해보세요. 함수명이나 설명 키워드를 사용해보세요.</p>
                <div class="search-suggestions">
                    <strong>추천 검색어:</strong>
                    <span class="suggestion-tag" onclick="document.getElementById('searchInput').value='VLOOKUP'; performSearch('VLOOKUP')">VLOOKUP</span>
                    <span class="suggestion-tag" onclick="document.getElementById('searchInput').value='IF'; performSearch('IF')">IF</span>
                    <span class="suggestion-tag" onclick="document.getElementById('searchInput').value='QUERY'; performSearch('QUERY')">QUERY</span>
                    <span class="suggestion-tag" onclick="document.getElementById('searchInput').value='오류'; performSearch('오류')">오류</span>
                </div>
            </div>
        `;
        document.querySelector('.main .container').appendChild(noResultsDiv);
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .no-results {
                text-align: center;
                padding: var(--space-32);
                background: var(--color-surface);
                border-radius: var(--radius-lg);
                margin: var(--space-24) 0;
                box-shadow: var(--shadow-sm);
            }
            .no-results h3 {
                color: var(--color-text-secondary);
                margin-bottom: var(--space-16);
            }
            .search-suggestions {
                margin-top: var(--space-16);
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-8);
                justify-content: center;
                align-items: center;
            }
            .suggestion-tag {
                background: var(--google-green);
                color: white;
                padding: var(--space-4) var(--space-8);
                border-radius: var(--radius-full);
                font-size: var(--font-size-xs);
                cursor: pointer;
                transition: all var(--duration-fast) var(--ease-standard);
            }
            .suggestion-tag:hover {
                background: var(--google-green-dark);
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }
    noResultsDiv.style.display = 'block';
}

function hideNoResults() {
    const noResultsDiv = document.getElementById('noResults');
    if (noResultsDiv) {
        noResultsDiv.style.display = 'none';
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 복사 기능
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-text');
            copyToClipboard(textToCopy, this);
        });
    });
}

async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        showCopyFeedback(button, true);
    } catch (err) {
        // 폴백: 텍스트 선택 방식
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopyFeedback(button, true);
        } catch (fallbackErr) {
            showCopyFeedback(button, false);
        }
        
        document.body.removeChild(textArea);
    }
}

function showCopyFeedback(button, success) {
    const originalText = button.textContent;
    
    if (success) {
        button.textContent = '복사됨!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } else {
        button.textContent = '복사 실패';
        button.style.background = 'var(--google-red)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
}

// 그리드 상호작용
function setupGridInteractions() {
    const gridContainer = document.querySelector('.grid-container');
    if (!gridContainer) return;

    const columnLabels = gridContainer.querySelectorAll('.column-label');
    const rowLabels = gridContainer.querySelectorAll('.row-label');
    const gridCells = gridContainer.querySelectorAll('.grid-cell');

    // 열 하이라이트
    columnLabels.forEach(label => {
        label.addEventListener('mouseenter', function() {
            const col = this.getAttribute('data-col');
            highlightColumn(col);
            showColumnTooltip(this, col);
        });

        label.addEventListener('mouseleave', function() {
            clearGridHighlights();
            hideTooltip();
        });
    });

    // 행 하이라이트
    rowLabels.forEach(label => {
        label.addEventListener('mouseenter', function() {
            const row = this.parentElement.getAttribute('data-row');
            highlightRow(row);
            showRowTooltip(this, row);
        });

        label.addEventListener('mouseleave', function() {
            clearGridHighlights();
            hideTooltip();
        });
    });

    // 셀 클릭
    gridCells.forEach(cell => {
        cell.addEventListener('click', function() {
            const row = this.getAttribute('data-row');
            const col = this.getAttribute('data-col');
            showCellInfo(this, row, col);
        });
    });
}

function highlightColumn(col) {
    const cells = document.querySelectorAll(`[data-col="${col}"]`);
    cells.forEach(cell => {
        if (cell.classList.contains('grid-cell')) {
            cell.classList.add('highlighted-col');
        }
    });
}

function highlightRow(row) {
    const cells = document.querySelectorAll(`[data-row="${row}"] .grid-cell`);
    cells.forEach(cell => {
        cell.classList.add('highlighted-row');
    });
}

function clearGridHighlights() {
    const highlighted = document.querySelectorAll('.highlighted-col, .highlighted-row');
    highlighted.forEach(element => {
        element.classList.remove('highlighted-col', 'highlighted-row');
    });
}

function showColumnTooltip(element, col) {
    const tooltip = createTooltip(`열 ${col}: 세로 방향 데이터 집합`);
    positionTooltip(tooltip, element);
}

function showRowTooltip(element, row) {
    const tooltip = createTooltip(`행 ${row}: 가로 방향 데이터 집합`);
    positionTooltip(tooltip, element);
}

function showCellInfo(element, row, col) {
    const content = element.textContent;
    let message = `셀 ${col}${row}: ${content}`;
    
    if (element.classList.contains('key-cell')) {
        message += ' (고유 식별자)';
    }
    
    const notification = createNotification(message);
    showNotification(notification);
}

function createTooltip(text) {
    let tooltip = document.getElementById('grid-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'grid-tooltip';
        tooltip.className = 'grid-tooltip';
        document.body.appendChild(tooltip);
        
        // 툴팁 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .grid-tooltip {
                position: absolute;
                background: var(--color-text);
                color: var(--color-background);
                padding: var(--space-8) var(--space-12);
                border-radius: var(--radius-base);
                font-size: var(--font-size-sm);
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity var(--duration-fast) var(--ease-standard);
                box-shadow: var(--shadow-md);
            }
            .grid-tooltip.visible {
                opacity: 1;
            }
            .highlighted-col {
                background: var(--google-blue) !important;
                color: white !important;
            }
            .highlighted-row {
                background: var(--google-green) !important;
                color: white !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    tooltip.textContent = text;
    return tooltip;
}

function positionTooltip(tooltip, element) {
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 40}px`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.classList.add('visible');
}

function hideTooltip() {
    const tooltip = document.getElementById('grid-tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

function createNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    return notification;
}

function showNotification(notification) {
    // 기존 알림 제거
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // 알림 스타일 추가 (한 번만)
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--google-green);
                color: white;
                padding: var(--space-12) var(--space-20);
                border-radius: var(--radius-base);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform var(--duration-normal) var(--ease-standard);
            }
            .notification.show {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 자동 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 부드러운 스크롤링
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // 네비 바 높이 고려
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // 네비게이션 링크 활성화
                updateActiveNavLink(this);
            }
        });
    });
}

// 네비게이션 하이라이트
function setupNavigationHighlight() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-80px 0px -80px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (correspondingLink) {
                    updateActiveNavLink(correspondingLink);
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
    
    // 활성 링크 스타일 추가
    if (!document.getElementById('nav-active-styles')) {
        const style = document.createElement('style');
        style.id = 'nav-active-styles';
        style.textContent = `
            .nav-link.active {
                background: var(--google-green);
                color: white;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }
}

// 로딩 애니메이션
function addLoadingAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    const animatedElements = document.querySelectorAll('.function-card, .example-card, .error-card');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // 애니메이션 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .function-card,
        .example-card,
        .error-card {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease-out;
        }
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K로 검색 포커스
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // ESC로 검색 초기화
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value) {
            searchInput.value = '';
            performSearch('');
            searchInput.blur();
        }
    }
});

// 페이지 로드 시 환영 메시지
window.addEventListener('load', function() {
    setTimeout(() => {
        const welcomeNotification = createNotification('구글 시트 조건부 함수 가이드에 오신 것을 환영합니다! 🎉');
        showNotification(welcomeNotification);
    }, 1000);
});

// 유틸리티 함수들
const utils = {
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 전역에서 사용할 수 있도록 노출
window.performSearch = performSearch;