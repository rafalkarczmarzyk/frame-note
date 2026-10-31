// Generate the Finder background with macOS system fonts; no extra image tooling.
import AppKit

let width = 640
let height = 400
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width * 2,
  pixelsHigh: height * 2, bitsPerSample: 8, samplesPerPixel: 4,
  hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
  bytesPerRow: 0, bitsPerPixel: 0)!
bitmap.size = NSSize(width: width, height: height)
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSColor(calibratedRed: 0.992, green: 1, blue: 0.988, alpha: 1).setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()
func centered(_ text: String, y: CGFloat, size: CGFloat, color: NSColor, weight: NSFont.Weight) {
  let attributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: size, weight: weight), .foregroundColor: color
  ]
  let string = text as NSString
  let dimensions = string.size(withAttributes: attributes)
  string.draw(at: NSPoint(x: (CGFloat(width) - dimensions.width) / 2, y: y), withAttributes: attributes)
}
let charcoal = NSColor(calibratedRed: 0.157, green: 0.18, blue: 0.231, alpha: 1)
let green = NSColor(calibratedRed: 0.078, green: 0.8, blue: 0.376, alpha: 1)
centered("FrameNote", y: 320, size: 30, color: charcoal, weight: .semibold)
centered("Drag FrameNote to Applications", y: 280, size: 16, color: charcoal, weight: .regular)
green.setStroke()
let arrow = NSBezierPath()
arrow.lineWidth = 3
arrow.lineCapStyle = .round
arrow.lineJoinStyle = .round
arrow.move(to: NSPoint(x: 284, y: 190))
arrow.line(to: NSPoint(x: 356, y: 190))
arrow.move(to: NSPoint(x: 344, y: 202))
arrow.line(to: NSPoint(x: 356, y: 190))
arrow.line(to: NSPoint(x: 344, y: 178))
arrow.stroke()
NSGraphicsContext.restoreGraphicsState()
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
