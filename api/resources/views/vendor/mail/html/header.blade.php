<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block;">
            {{-- <img src="/logo.svg" class="logo" alt="logo"> --}}
            <picture>
                <img src="data:image/webp;base64,<?= base64_encode(file_get_contents(base_path().'/../frontend/logo.webp')) ?>" alt="logo" style="width: 100px; height: 100px; object-fit: contain;" />
            </picture>
        </a>
    </td>
</tr>
