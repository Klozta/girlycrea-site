(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/LoadingSpinner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Spinner de chargement réutilisable
 */ __turbopack_context__.s([
    "LoadingSpinner",
    ()=>LoadingSpinner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    // Normaliser className pour éviter les différences serveur/client
    const normalizedClassName = className ? className.trim() : '';
    const divClassName = normalizedClassName ? `flex items-center justify-center ${normalizedClassName}` : 'flex items-center justify-center';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: divClassName,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: `animate-spin ${sizeClasses[size]} text-pink-600`,
            xmlns: "http://www.w3.org/2000/svg",
            fill: "none",
            viewBox: "0 0 24 24",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    className: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "4"
                }, void 0, false, {
                    fileName: "[project]/components/LoadingSpinner.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                }, void 0, false, {
                    fileName: "[project]/components/LoadingSpinner.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/LoadingSpinner.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/LoadingSpinner.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = LoadingSpinner;
var _c;
__turbopack_context__.k.register(_c, "LoadingSpinner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/store/viewHistoryStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Store pour l'historique de navigation (produits récemment consultés)
 * localStorage + sync backend si connecté
 */ __turbopack_context__.s([
    "viewHistoryStore",
    ()=>viewHistoryStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use client';
const STORAGE_KEY = 'girlycrea-view-history';
const MAX_ITEMS = 20;
const EXPIRY_DAYS = 30;
function loadFromStorage() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const items = JSON.parse(stored);
        const now = new Date();
        const expiryDate = new Date(now.getTime() - EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        // Filtrer les items expirés
        const valid = items.filter((item)=>new Date(item.viewedAt) > expiryDate);
        // Limiter à MAX_ITEMS (garder les plus récents)
        const sorted = valid.sort((a, b)=>new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
        return sorted.slice(0, MAX_ITEMS);
    } catch  {
        return [];
    }
}
function saveToStorage(items) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        // Déclencher un événement pour sync cross-tab
        window.dispatchEvent(new CustomEvent('viewHistoryUpdated'));
    } catch (error) {
        console.error('Erreur sauvegarde historique', error);
    }
}
const viewHistoryStore = {
    items: loadFromStorage(),
    addProduct: (product)=>{
        const now = new Date().toISOString();
        const viewedProduct = {
            ...product,
            viewedAt: now
        };
        // Retirer si déjà présent (éviter doublons)
        const filtered = viewHistoryStore.items.filter((item)=>item.id !== product.id);
        // Ajouter au début
        const updated = [
            viewedProduct,
            ...filtered
        ].slice(0, MAX_ITEMS);
        viewHistoryStore.items = updated;
        saveToStorage(updated);
    },
    getRecent: (limit = 10)=>{
        return viewHistoryStore.items.slice(0, limit);
    },
    clear: ()=>{
        viewHistoryStore.items = [];
        saveToStorage([]);
    },
    syncToBackend: async (userId)=>{
        try {
            const API_URL = ("TURBOPACK compile-time value", "http://localhost:3001/api") || 'http://localhost:3001/api';
            // Envoyer l'historique au backend pour persistance
            await fetch(`${API_URL}/user/view-history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    items: viewHistoryStore.items
                })
            });
        } catch (error) {
            // Non-bloquant : on continue même si sync échoue
            console.warn('Erreur sync historique backend', error);
        }
    }
};
// Sync cross-tab
if ("TURBOPACK compile-time truthy", 1) {
    window.addEventListener('storage', (e)=>{
        if (e.key === STORAGE_KEY && e.newValue) {
            try {
                viewHistoryStore.items = JSON.parse(e.newValue);
            } catch  {
            // Ignore
            }
        }
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/RecentlyViewed.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Composant "Produits récemment consultés"
 */ __turbopack_context__.s([
    "RecentlyViewed",
    ()=>RecentlyViewed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2f$viewHistoryStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store/viewHistoryStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function RecentlyViewed({ limit = 8, title = 'Récemment consultés', showEmpty = false }) {
    _s();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RecentlyViewed.useEffect": ()=>{
            const loadHistory = {
                "RecentlyViewed.useEffect.loadHistory": ()=>{
                    const recent = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2f$viewHistoryStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["viewHistoryStore"].getRecent(limit);
                    setItems(recent);
                    setIsLoading(false);
                }
            }["RecentlyViewed.useEffect.loadHistory"];
            loadHistory();
            // Écouter les mises à jour cross-tab
            const handleUpdate = {
                "RecentlyViewed.useEffect.handleUpdate": ()=>loadHistory()
            }["RecentlyViewed.useEffect.handleUpdate"];
            window.addEventListener('viewHistoryUpdated', handleUpdate);
            return ({
                "RecentlyViewed.useEffect": ()=>{
                    window.removeEventListener('viewHistoryUpdated', handleUpdate);
                }
            })["RecentlyViewed.useEffect"];
        }
    }["RecentlyViewed.useEffect"], [
        limit
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-pulse space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"
                    }, void 0, false, {
                        fileName: "[project]/components/RecentlyViewed.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4",
                        children: [
                            ...Array(limit)
                        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "aspect-square bg-gray-200 dark:bg-gray-700 rounded"
                            }, i, false, {
                                fileName: "[project]/components/RecentlyViewed.tsx",
                                lineNumber: 54,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/RecentlyViewed.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RecentlyViewed.tsx",
                lineNumber: 50,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/RecentlyViewed.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, this);
    }
    if (items.length === 0) {
        if (!showEmpty) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/components/RecentlyViewed.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 dark:text-gray-400 text-center py-8",
                    children: "Aucun produit consulté récemment"
                }, void 0, false, {
                    fileName: "[project]/components/RecentlyViewed.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/RecentlyViewed.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900 dark:text-gray-100",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/RecentlyViewed.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    items.length > limit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/account?tab=history",
                        className: "text-sm text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300",
                        children: "Voir tout →"
                    }, void 0, false, {
                        fileName: "[project]/components/RecentlyViewed.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RecentlyViewed.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4",
                children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: `/products/${item.id}`,
                        className: "group relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 transition-all hover:shadow-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative w-full h-full",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: item.image || '/placeholder-product.jpg',
                                    alt: item.title,
                                    fill: true,
                                    className: "object-cover group-hover:scale-105 transition-transform duration-200",
                                    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
                                }, void 0, false, {
                                    fileName: "[project]/components/RecentlyViewed.tsx",
                                    lineNumber: 97,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/RecentlyViewed.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-white text-xs font-medium line-clamp-1",
                                        children: item.title
                                    }, void 0, false, {
                                        fileName: "[project]/components/RecentlyViewed.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-white text-sm font-bold",
                                        children: [
                                            item.price.toFixed(2),
                                            "€"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/RecentlyViewed.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RecentlyViewed.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this)
                        ]
                    }, item.id, true, {
                        fileName: "[project]/components/RecentlyViewed.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/RecentlyViewed.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/RecentlyViewed.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_s(RecentlyViewed, "mcrZo4YemGCEUcnbKDFRdh7WECQ=");
_c = RecentlyViewed;
var _c;
__turbopack_context__.k.register(_c, "RecentlyViewed");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CourseLevelBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Badge niveau de cours (débutant/intermédiaire/avancé)
 */ __turbopack_context__.s([
    "CourseLevelBadge",
    ()=>CourseLevelBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function CourseLevelBadge({ level, className = '' }) {
    const colors = {
        débutant: 'bg-green-100 text-green-800 border-green-200',
        intermédiaire: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        avancé: 'bg-red-100 text-red-800 border-red-200'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-block px-3 py-1 rounded-full text-xs font-semibold border ${colors[level]} ${className}`,
        children: level.charAt(0).toUpperCase() + level.slice(1)
    }, void 0, false, {
        fileName: "[project]/components/CourseLevelBadge.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = CourseLevelBadge;
var _c;
__turbopack_context__.k.register(_c, "CourseLevelBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/data/courses.data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Données exemples pour les cours de crochet
 * TODO: Remplacer par API backend plus tard
 */ __turbopack_context__.s([
    "coursesData",
    ()=>coursesData
]);
const coursesData = [
    {
        id: 'course-1',
        title: 'Initiation au crochet - Découverte',
        description: 'Apprenez les bases du crochet en 1h. Parfait pour débuter votre apprentissage ! Découvrez les points essentiels et créez votre premier projet.',
        price: 19,
        duration: '1h',
        level: 'débutant',
        format: 'en ligne',
        instructor_id: 'instructor-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        instructor: {
            name: 'Marie Dupont',
            bio: 'Professeure de crochet depuis 10 ans, spécialisée dans l\'enseignement aux débutants',
            image: '/instructors/marie.jpg'
        },
        image: '/courses/initiation.jpg',
        rating: 4.8,
        badge: 'Nouveau',
        objectives: [
            'Maîtriser la tenue du crochet et du fil',
            'Apprendre les points de base (maille en l\'air, maille serrée)',
            'Réaliser votre premier projet simple',
            'Comprendre la lecture d\'un patron'
        ],
        prerequisites: [
            'Aucun prérequis nécessaire'
        ],
        lessons: [
            {
                title: 'Introduction au crochet',
                duration: '5min',
                description: 'Découverte du matériel et des bases'
            },
            {
                title: 'Les points fondamentaux',
                duration: '30min',
                description: 'Maille en l\'air, maille serrée, bride'
            },
            {
                title: 'Premier projet : Écharpe simple',
                duration: '25min',
                description: 'Création d\'une écharpe pour mettre en pratique'
            }
        ],
        faq: [
            {
                question: 'Ai-je besoin de matériel pour commencer ?',
                answer: 'Oui, vous aurez besoin d\'un crochet (taille 4mm recommandée) et d\'une pelote de laine. Une liste complète vous sera fournie après inscription.'
            },
            {
                question: 'Le cours est-il adapté aux vrais débutants ?',
                answer: 'Absolument ! Ce cours est spécialement conçu pour les personnes qui n\'ont jamais tenu un crochet.'
            },
            {
                question: 'Puis-je suivre le cours à mon rythme ?',
                answer: 'Oui, le cours est disponible en ligne et vous pouvez le suivre quand vous voulez, à votre rythme.'
            }
        ],
        reviews: [
            {
                name: 'Sophie L.',
                rating: 5,
                comment: 'Parfait pour débuter ! Marie explique très bien.',
                date: '2024-01-15'
            },
            {
                name: 'Julie M.',
                rating: 4,
                comment: 'Très bon cours, j\'ai réussi mon premier projet !',
                date: '2024-01-20'
            }
        ]
    },
    {
        id: 'course-2',
        title: 'Pack Débutant - Maîtrisez le crochet',
        description: 'Formation complète de 4h pour maîtriser toutes les bases du crochet. De zéro à la création de projets complexes.',
        price: 59,
        duration: '4h',
        level: 'débutant',
        format: 'en ligne',
        instructor_id: 'instructor-2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        instructor: {
            name: 'Sophie Martin',
            bio: 'Créatrice et formatrice certifiée, auteure de 3 livres sur le crochet',
            image: '/instructors/sophie.jpg'
        },
        image: '/courses/pack-debutant.jpg',
        rating: 4.9,
        badge: 'Populaire',
        objectives: [
            'Maîtriser tous les points de base',
            'Apprendre à lire et suivre un patron',
            'Créer des projets variés (écharpe, bonnet, sac)',
            'Comprendre les augmentations et diminutions'
        ],
        prerequisites: [
            'Aucun prérequis'
        ],
        lessons: [
            {
                title: 'Module 1 : Les bases complètes',
                duration: '1h',
                description: 'Tous les points essentiels'
            },
            {
                title: 'Module 2 : Techniques avancées débutant',
                duration: '1h',
                description: 'Augmentations, diminutions, changement de couleur'
            },
            {
                title: 'Module 3 : Projets pratiques',
                duration: '2h',
                description: '3 projets complets : écharpe, bonnet, sac'
            }
        ],
        faq: [
            {
                question: 'Quelle est la différence avec le cours initiation ?',
                answer: 'Ce pack est plus complet (4h vs 1h) et inclut plusieurs projets pratiques pour vraiment maîtriser les techniques.'
            },
            {
                question: 'Combien de temps ai-je pour terminer le cours ?',
                answer: 'Vous avez un accès à vie ! Vous pouvez suivre le cours à votre rythme, sans limite de temps.'
            }
        ],
        reviews: [
            {
                name: 'Emma D.',
                rating: 5,
                comment: 'Excellent pack ! J\'ai créé 3 projets magnifiques.',
                date: '2024-01-10'
            },
            {
                name: 'Lucas P.',
                rating: 5,
                comment: 'Très bien structuré, parfait pour progresser.',
                date: '2024-01-18'
            }
        ]
    },
    {
        id: 'course-3',
        title: 'Pack Avancé - Techniques expertes',
        description: 'Perfectionnez-vous avec 6h de cours sur les techniques avancées.',
        price: 89,
        duration: '6h',
        level: 'avancé',
        format: 'en ligne',
        instructor_id: 'instructor-3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        instructor: {
            name: 'Claire Bernard',
            bio: 'Artisane professionnelle, 15 ans d\'expérience',
            image: '/instructors/claire.jpg'
        },
        image: '/courses/pack-avance.jpg',
        rating: 5.0,
        badge: 'Meilleur prix'
    },
    {
        id: 'course-4',
        title: 'Cours Privé Personnalisé',
        description: 'Cours individuel adapté à vos besoins. Choisissez votre horaire et votre programme.',
        price: 25,
        duration: '1h',
        level: 'intermédiaire',
        format: 'mixte',
        instructor_id: 'instructor-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        instructor: {
            name: 'Marie Dupont',
            bio: 'Professeure de crochet depuis 10 ans',
            image: '/instructors/marie.jpg'
        },
        image: '/courses/cours-prive.jpg',
        rating: 4.7,
        badge: null
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/FeaturedCourses.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Composant cours en vedette pour la page d'accueil
 */ __turbopack_context__.s([
    "FeaturedCourses",
    ()=>FeaturedCourses
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CourseLevelBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CourseLevelBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$courses$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data/courses.data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
'use client';
;
;
;
;
function FeaturedCourses() {
    // Utiliser directement les données sans vérification mounted
    // Les données sont statiques donc pas de problème d'hydratation
    const featuredCourses = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$courses$2e$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["coursesData"].slice(0, 3);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-6",
        children: featuredCourses.map((course)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: `/courses/${course.id}`,
                        className: "relative block h-48 bg-gradient-to-br from-pink-50 to-purple-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full h-full flex items-center justify-center text-gray-400",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-16 h-16",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/FeaturedCourses.tsx",
                                        lineNumber: 25,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/FeaturedCourses.tsx",
                                    lineNumber: 24,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/FeaturedCourses.tsx",
                                lineNumber: 23,
                                columnNumber: 13
                            }, this),
                            course.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-3 right-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `px-3 py-1 rounded-full text-xs font-bold text-white ${course.badge === 'Nouveau' ? 'bg-green-500' : course.badge === 'Populaire' ? 'bg-pink-600' : 'bg-blue-600'}`,
                                    children: course.badge
                                }, void 0, false, {
                                    fileName: "[project]/app/components/FeaturedCourses.tsx",
                                    lineNumber: 30,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/FeaturedCourses.tsx",
                                lineNumber: 29,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-3 left-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CourseLevelBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CourseLevelBadge"], {
                                    level: course.level
                                }, void 0, false, {
                                    fileName: "[project]/app/components/FeaturedCourses.tsx",
                                    lineNumber: 44,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/FeaturedCourses.tsx",
                                lineNumber: 43,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/FeaturedCourses.tsx",
                        lineNumber: 22,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold text-lg mb-2 hover:text-pink-600 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/courses/${course.id}`,
                                    children: course.title
                                }, void 0, false, {
                                    fileName: "[project]/app/components/FeaturedCourses.tsx",
                                    lineNumber: 49,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/FeaturedCourses.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-600 mb-4 line-clamp-2",
                                children: course.description
                            }, void 0, false, {
                                fileName: "[project]/app/components/FeaturedCourses.tsx",
                                lineNumber: 51,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-2xl font-bold text-emerald-600",
                                        children: [
                                            course.price,
                                            "€"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/FeaturedCourses.tsx",
                                        lineNumber: 53,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/courses/${course.id}`,
                                        className: "text-pink-600 hover:text-pink-700 font-medium text-sm",
                                        children: "Voir le cours →"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/FeaturedCourses.tsx",
                                        lineNumber: 54,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/FeaturedCourses.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/FeaturedCourses.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this)
                ]
            }, course.id, true, {
                fileName: "[project]/app/components/FeaturedCourses.tsx",
                lineNumber: 18,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/FeaturedCourses.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_c = FeaturedCourses;
var _c;
__turbopack_context__.k.register(_c, "FeaturedCourses");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/store/cartStoreSimple.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Store panier simplifié sans zustand (temporaire)
 * Utilise localStorage directement
 */ __turbopack_context__.s([
    "cartStoreSimple",
    ()=>cartStoreSimple
]);
'use client';
const CART_KEY = 'girlycrea-cart';
const CART_KEY_SESSION = 'girlycrea-cart-session';
function getCart() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        // Essayer localStorage d'abord
        const stored = localStorage.getItem(CART_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            const items = parsed.state?.items || parsed.items || [];
            // Synchroniser avec sessionStorage (fallback)
            try {
                sessionStorage.setItem(CART_KEY_SESSION, JSON.stringify({
                    state: {
                        items
                    }
                }));
            } catch  {
            // Ignore si sessionStorage bloqué
            }
            return items;
        }
        // Fallback: sessionStorage si localStorage vide
        const sessionStored = sessionStorage.getItem(CART_KEY_SESSION);
        if (sessionStored) {
            const parsed = JSON.parse(sessionStored);
            return parsed.state?.items || parsed.items || [];
        }
        return [];
    } catch  {
        return [];
    }
}
function saveCart(items) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const payload = JSON.stringify({
        state: {
            items
        }
    });
    try {
        localStorage.setItem(CART_KEY, payload);
    } catch  {
        // Fallback: sessionStorage si localStorage bloqué
        try {
            sessionStorage.setItem(CART_KEY_SESSION, payload);
        } catch  {
        // Ignore si les deux sont bloqués
        }
    }
}
const cartStoreSimple = {
    getItems: ()=>getCart(),
    setItems: (items)=>{
        saveCart(items);
        if ("TURBOPACK compile-time truthy", 1) {
            window.dispatchEvent(new Event('storage'));
        }
    },
    addItem: (product)=>{
        const items = getCart();
        const existing = items.find((item)=>item.id === product.id);
        if (existing) {
            // Pour les cours, pas de limite de stock
            if (product.type === 'course') {
                existing.quantity = existing.quantity + 1;
            } else {
                existing.quantity = Math.min(existing.quantity + 1, existing.stock);
            }
        } else {
            items.push({
                ...product,
                quantity: 1
            });
        }
        saveCart(items);
        window.dispatchEvent(new Event('storage'));
    },
    removeItem: (id)=>{
        const items = getCart().filter((item)=>item.id !== id);
        saveCart(items);
        window.dispatchEvent(new Event('storage'));
    },
    updateQuantity: (id, quantity)=>{
        if (quantity <= 0) {
            cartStoreSimple.removeItem(id);
            return;
        }
        const items = getCart();
        const item = items.find((i)=>i.id === id);
        if (item) {
            // Pour les cours, pas de limite de stock
            if (item.type === 'course') {
                item.quantity = quantity;
            } else {
                item.quantity = Math.min(quantity, item.stock);
            }
            saveCart(items);
            window.dispatchEvent(new Event('storage'));
        }
    },
    clearCart: ()=>{
        saveCart([]);
        window.dispatchEvent(new Event('storage'));
    },
    getTotalItems: ()=>{
        return getCart().reduce((total, item)=>total + item.quantity, 0);
    },
    getTotalPrice: ()=>{
        return getCart().reduce((total, item)=>total + item.price * item.quantity, 0);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AddToCartButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Bouton "Ajouter au panier"
 * Toast notification + optimistic update
 */ __turbopack_context__.s([
    "AddToCartButton",
    ()=>AddToCartButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/analytics.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2f$cartStoreSimple$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store/cartStoreSimple.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function AddToCartButton({ product, className = '' }) {
    _s();
    const [isAdding, setIsAdding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showToast, setShowToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleAddToCart = async ()=>{
        if (product.stock === 0) {
            alert('Produit en rupture de stock');
            return;
        }
        setIsAdding(true);
        // Optimistic update
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2f$cartStoreSimple$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cartStoreSimple"].addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0] || '/placeholder-product.jpg',
            stock: product.stock,
            type: 'product'
        });
        // Analytics
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ecommerce"].addToCart(product.id, product.title, product.price, 1);
        // Toast notification
        setShowToast(true);
        setTimeout(()=>setShowToast(false), 3000);
        setIsAdding(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleAddToCart,
                disabled: isAdding || product.stock === 0,
                className: `
          ${className}
          px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg
          hover:bg-pink-700 active:scale-95 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
        `,
                "aria-label": `Ajouter ${product.title} au panier`,
                children: isAdding ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "animate-spin h-5 w-5",
                            viewBox: "0 0 24 24",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    className: "opacity-25",
                                    cx: "12",
                                    cy: "12",
                                    r: "10",
                                    stroke: "currentColor",
                                    strokeWidth: "4",
                                    fill: "none"
                                }, void 0, false, {
                                    fileName: "[project]/components/AddToCartButton.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    className: "opacity-75",
                                    fill: "currentColor",
                                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                }, void 0, false, {
                                    fileName: "[project]/components/AddToCartButton.tsx",
                                    lineNumber: 82,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AddToCartButton.tsx",
                            lineNumber: 72,
                            columnNumber: 13
                        }, this),
                        "Ajout..."
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AddToCartButton.tsx",
                    lineNumber: 71,
                    columnNumber: 11
                }, this) : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'
            }, void 0, false, {
                fileName: "[project]/components/AddToCartButton.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            showToast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up",
                children: "✅ Produit ajouté au panier !"
            }, void 0, false, {
                fileName: "[project]/components/AddToCartButton.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(AddToCartButton, "IJJbaxYsJuqspfPwcgU4qfMkrPw=");
_c = AddToCartButton;
var _c;
__turbopack_context__.k.register(_c, "AddToCartButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/OptimizedImage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Composant Image optimisé avec WebP, lazy loading, responsive sizes
 * Wrapper autour de next/image avec optimisations par défaut
 */ __turbopack_context__.s([
    "OptimizedImage",
    ()=>OptimizedImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const DEFAULT_BLUR_DATA_URL = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
function OptimizedImage({ src, alt, width, height, fill = false, sizes, priority = false, className = '', objectFit = 'cover', quality = 85, placeholder = 'blur', blurDataURL = DEFAULT_BLUR_DATA_URL, onError }) {
    _s();
    const [imgSrc, setImgSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(src);
    const [hasError, setHasError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Fallback si image échoue
    const handleError = ()=>{
        if (!hasError && imgSrc !== '/placeholder-product.jpg') {
            setHasError(true);
            setImgSrc('/placeholder-product.jpg');
            onError?.();
        }
    };
    // Sizes responsive par défaut si non fourni
    const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    // Props communes
    const objectFitClass = objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : objectFit === 'fill' ? 'object-fill' : objectFit === 'none' ? 'object-none' : 'object-scale-down';
    const commonProps = {
        src: imgSrc,
        alt,
        className: `${className} ${objectFitClass}`.trim(),
        quality,
        placeholder,
        blurDataURL,
        onError: handleError,
        loading: priority ? 'eager' : 'lazy',
        sizes: defaultSizes
    };
    if (fill) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            ...commonProps,
            fill: true
        }, void 0, false, {
            fileName: "[project]/components/OptimizedImage.tsx",
            lineNumber: 74,
            columnNumber: 12
        }, this);
    }
    if (!width || !height) {
        // Si pas de dimensions, utiliser aspect ratio 16:9 par défaut
        const defaultWidth = width || 400;
        const defaultHeight = height || defaultWidth * 9 / 16;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            ...commonProps,
            width: defaultWidth,
            height: defaultHeight
        }, void 0, false, {
            fileName: "[project]/components/OptimizedImage.tsx",
            lineNumber: 81,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        ...commonProps,
        width: width,
        height: height
    }, void 0, false, {
        fileName: "[project]/components/OptimizedImage.tsx",
        lineNumber: 84,
        columnNumber: 10
    }, this);
}
_s(OptimizedImage, "Fl7GLmlkY+yJdGTcKvX++ZiOFBo=");
_c = OptimizedImage;
var _c;
__turbopack_context__.k.register(_c, "OptimizedImage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/products/components/ProductCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Card produit avec bouton "Ajouter au panier"
 */ __turbopack_context__.s([
    "ProductCard",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AddToCartButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AddToCartButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OptimizedImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/OptimizedImage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
'use client';
;
;
;
;
function ProductCard({ product }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden h-full flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: `/products/${product.id}`,
                className: "relative w-full h-80 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OptimizedImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OptimizedImage"], {
                        src: product.images[0] || '/placeholder-product.jpg',
                        alt: product.title,
                        fill: true,
                        className: "group-hover:scale-105 transition-transform duration-500",
                        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
                        objectFit: "cover"
                    }, void 0, false, {
                        fileName: "[project]/app/products/components/ProductCard.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-3 right-3 flex items-center gap-2",
                        children: product.stock === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold",
                            children: "Rupture"
                        }, void 0, false, {
                            fileName: "[project]/app/products/components/ProductCard.tsx",
                            lineNumber: 43,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/products/components/ProductCard.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/products/components/ProductCard.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 flex flex-col flex-grow",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold text-lg line-clamp-2 leading-tight mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 dark:text-white transition-colors",
                        children: product.title
                    }, void 0, false, {
                        fileName: "[project]/app/products/components/ProductCard.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    product.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 flex-grow",
                        children: product.description
                    }, void 0, false, {
                        fileName: "[project]/app/products/components/ProductCard.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-2xl font-bold text-emerald-600",
                                children: [
                                    product.price.toFixed(2),
                                    "€"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/products/components/ProductCard.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-gray-500 dark:text-gray-400",
                                children: [
                                    "Stock: ",
                                    product.stock
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/products/components/ProductCard.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/products/components/ProductCard.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AddToCartButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AddToCartButton"], {
                        product: product,
                        className: "w-full"
                    }, void 0, false, {
                        fileName: "[project]/app/products/components/ProductCard.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/products/components/ProductCard.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/products/components/ProductCard.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = ProductCard;
var _c;
__turbopack_context__.k.register(_c, "ProductCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils/logger.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Logger utilitaire pour production/dev
 */ __turbopack_context__.s([
    "logger",
    ()=>logger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const isDev = ("TURBOPACK compile-time value", "development") === 'development';
const logger = {
    error: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.error(...args);
        }
    // En production, on pourrait envoyer à un service de logging
    },
    warn: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.warn(...args);
        }
    },
    log: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.log(...args);
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/FeaturedProducts.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Composant produits en vedette pour la page d'accueil
 */ __turbopack_context__.s([
    "FeaturedProducts",
    ()=>FeaturedProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$products$2f$components$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/products/components/ProductCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LoadingSpinner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/logger.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function FeaturedProducts() {
    _s();
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FeaturedProducts.useEffect": ()=>{
            async function fetchFeaturedProducts() {
                try {
                    setIsLoading(true);
                    // Utiliser sort=newest (les plus récents) au lieu de popular qui n'existe pas
                    const response = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/products?limit=8&sort=newest`, {
                        credentials: 'include'
                    });
                    if (!response.ok) {
                        const errorText = await response.text();
                        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                        try {
                            const errorJson = JSON.parse(errorText);
                            errorMessage = errorJson.error || errorJson.message || errorMessage;
                        } catch  {
                            // Si ce n'est pas du JSON, utiliser le texte brut
                            if (errorText) errorMessage = errorText;
                        }
                        throw new Error(errorMessage);
                    }
                    const data = await response.json();
                    setProducts(data.products || data || []);
                } catch (err) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logger"].error('Erreur fetch produits:', err);
                    // Améliorer le message d'erreur pour "Failed to fetch"
                    if (err instanceof TypeError && err.message === 'Failed to fetch') {
                        setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 3001.');
                    } else {
                        setError(err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des produits');
                    }
                } finally{
                    setIsLoading(false);
                }
            }
            fetchFeaturedProducts();
        }
    }["FeaturedProducts.useEffect"], []);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoadingSpinner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoadingSpinner"], {}, void 0, false, {
                fileName: "[project]/app/components/FeaturedProducts.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/FeaturedProducts.tsx",
            lineNumber: 60,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-red-400 mb-4",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/app/components/FeaturedProducts.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/products",
                    className: "inline-block px-8 py-4 glass border-2 border-neon-blue/50 text-neon-blue font-bold rounded-lg hover:border-neon-blue transition-all transform hover:scale-105 hover:shadow-neon-blue",
                    children: "Voir tous les produits"
                }, void 0, false, {
                    fileName: "[project]/app/components/FeaturedProducts.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/FeaturedProducts.tsx",
            lineNumber: 68,
            columnNumber: 7
        }, this);
    }
    if (products.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-400 mb-4",
                    children: "Aucun produit disponible pour le moment"
                }, void 0, false, {
                    fileName: "[project]/app/components/FeaturedProducts.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/products",
                    className: "inline-block px-8 py-4 glass border-2 border-neon-blue/50 text-neon-blue font-bold rounded-lg hover:border-neon-blue transition-all transform hover:scale-105 hover:shadow-neon-blue",
                    children: "Voir tous les produits"
                }, void 0, false, {
                    fileName: "[project]/app/components/FeaturedProducts.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/FeaturedProducts.tsx",
            lineNumber: 82,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
        children: products.slice(0, 8).map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$products$2f$components$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductCard"], {
                product: product
            }, product.id, false, {
                fileName: "[project]/app/components/FeaturedProducts.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/FeaturedProducts.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(FeaturedProducts, "NWjSAcPihV4/isUEFvf7y5R+Cbo=");
_c = FeaturedProducts;
var _c;
__turbopack_context__.k.register(_c, "FeaturedProducts");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_6c64c152._.js.map