package com.weddingos.api.security;

import com.weddingos.api.model.WeddingMembership;

import java.util.function.Function;

/**
 * Workspace modules and the membership flag that grants an ORGANIZER access to each.
 * ADMINs and the wedding owner have every module. Per the PRD, organizers "can access only
 * modules/actions granted by an Admin", so the flag gates reads as well as writes.
 */
public enum WeddingModule {
    EVENTS(WeddingMembership::getCanManageEvents),
    TASKS(WeddingMembership::getCanManageTasks),
    GUESTS(WeddingMembership::getCanManageGuests),
    CHECK_IN(WeddingMembership::getCanCheckInGuests),
    EXPENSES(WeddingMembership::getCanManageExpenses),
    VENDORS(WeddingMembership::getCanManageVendors),
    WEBSITE(WeddingMembership::getCanManageWebsite),
    GALLERY(WeddingMembership::getCanModerateGallery);

    private final Function<WeddingMembership, Boolean> flag;

    WeddingModule(Function<WeddingMembership, Boolean> flag) {
        this.flag = flag;
    }

    public boolean grantedBy(WeddingMembership membership) {
        return membership != null && Boolean.TRUE.equals(flag.apply(membership));
    }
}
