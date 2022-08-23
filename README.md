# RSVPlet

An RSVP reader contained entirely within a bookmarklet!

## How to use

### Installation

- Go to [source.js](source.js)
- Copy the entire contents of the file
- Create a bookmark in your browser
  - Name it `RSVPlet`
  - Set the URL to the code you copied

I wanted to make a bookmarklet link that you could just drag into the bookmarks
bar, but GitHub doesn't allow embedding JavaScript links into markup files.

### Usage

- Highlight whatever text you want to read
- Click the bookmarklet

If you want to change the speed or colors or anything, simply edit the
`settings` dictionary near the beginning of the bookmarklet's URL.

## What is this?

[RSVP](https://en.wikipedia.org/wiki/Rapid_serial_visual_presentation) is a
technique to flash words sequentially in a way that allows high speed reading
(hundreds of words per minute) without having to move the eyes.

RSVPlet (**RSVP** bookmark**let**) is a functional and simple RSVP reader that
lives completely contained in a bookmarklet with no installation required and
no need to access the internet for anything.

This mechanism allows it to be easily accessible on any major browser while
being fully configurable and pretty.

## Why is this?

I learned about RSVP readers in 2020 and found them to be quite nice for
reading anything that wasn't too technical and didn't require expert
understanding (traditional slow reading still gives better reading
comprehension).

I particularly liked how the
[Stutter](https://github.com/jamestomasino/stutter) reader looked and worked,
however it required installing an extension, which I couldn't do on my work
computer. So I then used [AccelaReader](https://accelareader.com/), but wasn't
too fond of how it looked or the extra steps to use it.

I decided to make my own RSVP reader, inspired by the beauty of Stutter and the
bookmarklet concept of AccelaReader. So here it is.

... Also I was bored on the bus going home one day, so writing the first version
was a nice little distraction for the 2 hour journey.
