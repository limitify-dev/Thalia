import { Dimensions, StyleSheet, View } from "react-native";
const { width, height } = Dimensions.get('window');

export const renderSkeletonImageGallery = () => (
    <View style={styles.imageGalleryContainer}>
        <View style={[styles.skeletonImage, { width: '100%', height: '100%' }]} />
    </View>
);

export const renderSkeletonGalleryInfo = () => (
    <View style={styles.galleryInfo}>
        <View style={[styles.skeletonText, { width: '70%', height: 30, marginBottom: 12 }]} />
        <View style={styles.ratingContainer}>
            <View style={[styles.skeletonText, { width: 40, height: 20 }]} />
            <View style={[styles.skeletonText, { width: 60, height: 20, marginLeft: 8 }]} />
        </View>
        <View style={[styles.skeletonText, { width: '50%', height: 20, marginTop: 12 }]} />
        <View style={[styles.skeletonText, { width: '40%', height: 20, marginTop: 12 }]} />
    </View>
);

export const renderSkeletonOverview = () => (
    <View style={styles.overviewSection}>
        <View style={[styles.skeletonText, { width: '30%', height: 24, marginBottom: 16 }]} />
        <View style={[styles.skeletonText, { width: '100%', height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeletonText, { width: '90%', height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeletonText, { width: '80%', height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeletonText, { width: '20%', height: 20, marginTop: 8 }]} />
    </View>
);

export const renderSkeletonLocation = () => (
    <View style={styles.locationSection}>
        <View style={[styles.skeletonText, { width: '30%', height: 24, marginBottom: 16 }]} />
        <View style={[styles.skeletonText, { width: '80%', height: 20, marginBottom: 16 }]} />
        <View style={[styles.skeletonImage, { height: 150, borderRadius: 12 }]} />
    </View>
);

export const renderSkeletonReviews = () => (
    <View style={styles.reviewsSection}>
        <View style={styles.reviewHeader}>
            <View style={[styles.skeletonText, { width: '30%', height: 24 }]} />
            <View style={[styles.skeletonText, { width: '20%', height: 20 }]} />
        </View>
        <View style={[styles.reviewCard, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <View style={styles.reviewUser}>
                <View style={[styles.skeletonImage, { width: 40, height: 40, borderRadius: 20 }]} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <View style={[styles.skeletonText, { width: '60%', height: 20 }]} />
                    <View style={[styles.skeletonText, { width: '30%', height: 16, marginTop: 4 }]} />
                </View>
            </View>
            <View style={[styles.skeletonText, { width: '100%', height: 16, marginTop: 12 }]} />
            <View style={[styles.skeletonText, { width: '90%', height: 16, marginTop: 8 }]} />
            <View style={[styles.skeletonText, { width: '20%', height: 14, marginTop: 8 }]} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageGalleryContainer: {
        width: width,
        height: height * 0.45,
    },
    wrapper: {},
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        bottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 4,
    },
    galleryInfo: {
        padding: 20,
    },
    galleryTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    reviewCount: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginLeft: 4,
    },
    exhibitionType: {
        marginBottom: 8,
    },
    exhibitionTypeText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 14,
    },
    locationSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    locationText: {
        fontSize: 14,
        flex: 1,
    },
    mapContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    reviewsSection: {
        padding: 20,
        paddingBottom: 100,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 12,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewRatingText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    reviewDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    reservationButton: {
        maxWidth: '90%',
        margin: 'auto',
        marginBottom: 20
    },
    reservationButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    overviewSection: {
        padding: 20,
        paddingTop: 0,
    },
    overviewText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    showMoreButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: '500',
    },
    overviewStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        fontSize: 12,
    },
    skeletonImage: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    skeletonText: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
    },
});