Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path (Get-Location) "assets\avatar-standing.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        $distFromEdge = [Math]::Min($x, $bmp.Width - $x)
        $topDist = $y
        $alpha = 1.0

        if ($distFromEdge -lt 32) {
            $alpha *= ($distFromEdge / 32.0)
        }
        if ($topDist -lt 28) {
            $alpha *= ($topDist / 28.0)
        }

        # If pixel is dark studio background and outside center body
        $brightness = ($c.R * 0.299 + $c.G * 0.587 + $c.B * 0.114)
        if ($brightness -lt 30 -and ($x -lt 75 -or $x -gt 435)) {
            $alpha *= [Math]::Max(0.0, ($brightness - 12) / 18.0)
        }

        $a = [int]([Math]::Max(0, [Math]::Min(255, $c.A * $alpha)))
        $outColor = [System.Drawing.Color]::FromArgb($a, $c.R, $c.G, $c.B)
        $outBmp.SetPixel($x, $y, $outColor)
    }
}

$bmp.Dispose()
$outPath = Join-Path (Get-Location) "assets\avatar-standing-clean.png"
$outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()
Write-Host "Created assets\avatar-standing-clean.png successfully!"
