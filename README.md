# spreed-webrtc Debian packaging

## Example build steps
First, grab the packaging from Git and configure your checkout. Omit this if you
already have a checkout of the packaging.

    $ git clone git@git.intranet.struktur.de:debian/spreed-webrtc
    $ cd spreed-webrtc
    $ git checkout upstream
    $ git checkout pristine-tar
    $ git checkout ubuntu/precise

If you're releasing a new upstream version, you should start by updating and
committing a Debian changelog entry for the new upstream version $VERSION.

    $ dch -v $VERSION-1

Next, you should pull in the new upstream tarball as follows:

    $ ./debian/rules get-orig-source
    $ mv spreed-webrtc_$VERSION.orig.tar.xz ..
    $ git-import-orig ../spreed-webrtc_$VERSION.orig.tar.xz
    What is the upstream version? [$VERSION]
    <hit enter, or provide -u$VERSION flag to bypass>

At this point, you should have successfully imported the new upstream tarball.

If you're working on releasing a packaging change for someone else's upstream
version, you'll need to obtain the original source tarball for the upstream
$VERSION as follows:

    $ pristine-tar checkout spreed-webrtc_$VERSION.orig.tar.xz
    $ mv spreed-webrtc_$VERSION.orig.tar.xz ..

Assuming you have a pbuilder $BASETGZ (typically stored under
`/var/cache/pbuilder`) for the given distribution prepared, you may now proceed
to build the package as follows:

    $ # You may skip updating if the pbuilder is known to be up to date.
    $ sudo pbuilder update --basetgz $BASETGZ
    $ pdebuild --buildresult `pwd`/../ --debbuildopts -sa -- --basetgz $BASETGZ

All going well, you should have a binary package in the directory specified by
`--buildresult`. Use `-S` as needed to produce a source build for uploading to
Launchpad. Then do the upload as follows:

    $ debsign ../spreed-webrtc_$VERSION-1_source.changes 
    $ dput ppa:strukturag/spreed-webrtc ../spreed-webrtc_$VERSION-1_source.changes

Once any archive uploads have been accepted, tag the version and push your
changes:

    $ git tag ubuntu/precise/$VERSION-1
    $ git push --all
    $ git push --tags

