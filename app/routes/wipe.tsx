import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { CVRefineSectionBackground } from "~/components/background";
import { usePuterStore } from "~/lib/puter";
import { Trash2, FileText, User, AlertTriangle, RefreshCw, ArrowLeft, Database, HardDrive } from "lucide-react";

const WipeApp = () => {
    const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleteComplete, setDeleteComplete] = useState(false);

    const loadFiles = async () => {
        try {
            const files = (await fs.readDir("./")) as FSItem[];
            setFiles(files || []);
        } catch (err) {
            console.error("Error loading files:", err);
            setFiles([]);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Delete all files
            for (const file of files) {
                await fs.delete(file.path);
            }
            
            // Clear KV storage
            await kv.flush();
            
            // Reload files to show empty state
            await loadFiles();
            
            setDeleteComplete(true);
            setShowConfirmation(false);
        } catch (err) {
            console.error("Error deleting files:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatFileSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return <FileText className="w-4 h-4 text-red-500" />;
            case 'txt':
                return <FileText className="w-4 h-4 text-gray-500" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
                return <FileText className="w-4 h-4 text-blue-500" />;
            default:
                return <FileText className="w-4 h-4 text-gray-400" />;
        }
    };

    if (isLoading) {
        return (
            <CVRefineSectionBackground className="h-screen w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading application data...</p>
                </div>
            </CVRefineSectionBackground>
        );
    }

    if (error) {
        return (
            <CVRefineSectionBackground className="h-screen w-full flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h2 className="text-lg font-semibold text-red-800">Error</h2>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={clearError}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </CVRefineSectionBackground>
        );
    }

    return (
        <CVRefineSectionBackground className="min-h-screen w-full">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link 
                                to="/" 
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">{auth.user?.username}</span>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <HardDrive className="w-8 h-8 text-red-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                        </div>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Manage your application data including uploaded resumes, analysis results, and cached files. 
                            Use this tool to clear all data and start fresh.
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Total Files</h3>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{files.length}</p>
                        <p className="text-sm text-gray-500">Stored files</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Database className="w-6 h-6 text-green-600" />
                            <h3 className="font-semibold text-gray-900">Storage Used</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {files.length > 0 ? 
                                formatFileSize(files.reduce((total, file) => total + (file.size || 0), 0)) : 
                                "0 B"
                            }
                        </p>
                        <p className="text-sm text-gray-500">Total space used</p>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <User className="w-6 h-6 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">Account Status</h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">Active</p>
                        <p className="text-sm text-gray-500">Authentication verified</p>
                    </div>
                </div>

                {/* Files List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Your Files ({files.length})
                        </h2>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {files.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {files.map((file) => (
                                    <div key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(file.name)}
                                                <div>
                                                    <p className="font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {file.created ? new Date(file.created).toLocaleDateString() : 'Unknown date'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-700">
                                                    {file.size ? formatFileSize(file.size) : 'Unknown size'}
                                                </p>
                                                {/* <p className="text-xs text-gray-500">{file. || 'Unknown type'}</p> */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                                <p className="text-gray-500">
                                    {deleteComplete ? 
                                        "All data has been successfully cleared!" : 
                                        "You haven't uploaded any files yet."
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Section */}
                {files.length > 0 && !deleteComplete && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                                <h2 className="text-2xl font-bold text-red-800">Danger Zone</h2>
                            </div>
                            
                            <p className="text-red-700 mb-6 max-w-2xl mx-auto">
                                This action will permanently delete all your uploaded resumes, analysis results, 
                                and cached data. This cannot be undone.
                            </p>

                            {!showConfirmation ? (
                                <button
                                    onClick={() => setShowConfirmation(true)}
                                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 mx-auto"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Clear All Data
                                </button>
                            ) : (
                                <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Are you absolutely sure?
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        This will delete {files.length} files and clear all stored data.
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => setShowConfirmation(false)}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Yes, Delete All
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {deleteComplete && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Data Cleared Successfully!</h2>
                        <p className="text-green-700 mb-6">
                            All your files and data have been permanently removed from the system.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Return to Home
                        </Link>
                    </div>
                )}
            </div>
        </CVRefineSectionBackground>
    );
};

export default WipeApp;