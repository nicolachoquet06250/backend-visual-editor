export default {};

declare global {
    import TypedArray = NodeJS.TypedArray;

    interface ShowDirectoryPickerOptions {
        id?: string,
        mode?: 'read'|'readwrite',
        startIn?: 'desktop'|'documents'|'downloads'|'music'|'pictures'|'videos'
    }

    interface Window {
        showDirectoryPicker(): Promise<FileSystemDirectoryHandle>
        showDirectoryPicker(options: ShowDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>
    }

    interface GetFileDirectoryHandleOptions {
        create: boolean
    }

    interface RemoveEntryOptions {
        recursive: boolean
    }

    interface FileSystemHandleQueryPermission {
        mode: 'read'|'readwrite'
    }

    interface FileSystemHandlePermissionDescriptor extends FileSystemHandleQueryPermission {}

    interface FileSystemHandleRemove extends RemoveEntryOptions {}

    interface FileSystemHandle {
        queryPermission(options: FileSystemHandleQueryPermission): 'granted'|'denied'|'prompt',
        remove(options: FileSystemHandleRemove): Promise<void>
        requestPermission(options: FileSystemHandlePermissionDescriptor): 'granted'|'denied'|'prompt'
    }

    interface FileSystemDirectoryHandle {
        entries(): [string, Promise<FileSystemDirectoryHandle|FileSystemFileHandle>][]
        values(): FileSystemFileHandle[]
        keys(): string[]

        getFileHandle(name: string): Promise<FileSystemFileHandle>
        getFileHandle(name: string, options: GetFileDirectoryHandleOptions): Promise<FileSystemFileHandle>

        getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>
        getDirectoryHandle(name: string, options: GetFileDirectoryHandleOptions): Promise<FileSystemDirectoryHandle>

        removeEntry(name: string): void
        removeEntry(name: string, options: RemoveEntryOptions): void

        resolve(possibleDescendant: FileSystemHandle): string[]|null
    }

    interface CreateWritableOptions {
        keepExistingData: boolean
    }

    interface FileSystemWritableFileStream extends WritableStream {
        write(data: ArrayBuffer|TypedArray|DataView|Blob|String|{
            type: 'write'|'seep'|'truncate',
            data?: ArrayBuffer|TypedArray|DataView|Blob|String|string,
            position?: number,
            size?: number
        }): Promise<void>
        seek(position: number): Promise<void>
        truncate(size: number): Promise<void>
    }

    interface FileSystemFileHandle {
        getFile(): Promise<File>
        createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>

        createWritable(): Promise<FileSystemWritableFileStream>
        createWritable(options: CreateWritableOptions): Promise<FileSystemWritableFileStream>
    }
}