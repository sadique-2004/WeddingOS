package com.weddingos.api.controller;

import com.weddingos.api.exception.NotFoundException;
import com.weddingos.api.service.InvitationService;
import com.weddingos.api.service.TaskService;
import com.weddingos.api.service.WebsiteService;
import com.weddingos.api.service.WorkspaceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * HTTP-level checks for the P0 safety fixes: disabled resets, required wedding IDs,
 * 404s for unknown records/slugs/tokens, and error bodies that never leak internals.
 */
@WebMvcTest(controllers = {
        WorkspaceController.class,
        WebsiteController.class,
        InvitationController.class,
        TaskController.class
})
class ApiSafetyWebTest {

    @Autowired MockMvc mvc;

    @MockBean WorkspaceService workspaceService;
    @MockBean WebsiteService websiteService;
    @MockBean InvitationService invitationService;
    @MockBean TaskService taskService;

    // ---- Disabled reset endpoints -------------------------------------------------------

    @Test
    void resetByQueryParamIsForbiddenAndDeletesNothing() throws Exception {
        mvc.perform(post("/api/v1/workspaces/reset").param("weddingId", "1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value(containsString("disabled")));
        verify(workspaceService, never()).resetWorkspaceData(any());
    }

    @Test
    void resetWithoutParamsIsForbidden() throws Exception {
        mvc.perform(post("/api/v1/workspaces/reset"))
                .andExpect(status().isForbidden());
        verify(workspaceService, never()).resetWorkspaceData(any());
    }

    @Test
    void resetByPathIdIsForbiddenAndDeletesNothing() throws Exception {
        mvc.perform(post("/api/v1/workspaces/1/reset"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(containsString("No data was changed")));
        verify(workspaceService, never()).resetWorkspaceData(any());
    }

    // ---- Unknown / missing IDs ------------------------------------------------------------

    @Test
    void unknownWorkspaceIdIs404() throws Exception {
        when(workspaceService.getActiveWorkspaceSummary(999L)).thenThrow(new NotFoundException("Wedding not found: 999"));

        mvc.perform(get("/api/v1/workspaces/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Wedding not found: 999"))
                .andExpect(jsonPath("$.path").value("/api/v1/workspaces/999"))
                .andExpect(jsonPath("$.trace").doesNotExist())
                .andExpect(jsonPath("$.exception").doesNotExist());
    }

    @Test
    void nonNumericWorkspaceIdIs400() throws Exception {
        mvc.perform(get("/api/v1/workspaces/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("id")));
        verifyNoInteractions(workspaceService);
    }

    @Test
    void missingWeddingIdIs400InsteadOfDefaultingToWedding1() throws Exception {
        mvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Missing required parameter: weddingId"));
        verifyNoInteractions(taskService);

        mvc.perform(get("/api/v1/website"))
                .andExpect(status().isBadRequest());
        verify(websiteService, never()).getWebsiteConfig(anyLong());
    }

    @Test
    void budgetUpdateWithoutAmountIs400() throws Exception {
        mvc.perform(put("/api/v1/workspaces/budget").param("weddingId", "5")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        verify(workspaceService, never()).updateBudgetTarget(any(), any());
    }

    // ---- Unknown slugs and tokens ----------------------------------------------------------

    @Test
    void unknownPublicSlugIs404() throws Exception {
        when(websiteService.getPublicWebsiteBySlug("nobody")).thenThrow(new NotFoundException("Wedding website not found for slug: nobody"));

        mvc.perform(get("/api/v1/public/w/nobody"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void invalidInvitationTokenIs404() throws Exception {
        when(invitationService.getByToken("wos-bad")).thenThrow(new NotFoundException("Invitation not found for the supplied token."));

        mvc.perform(get("/api/v1/public/invite/wos-bad"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Invitation not found for the supplied token."));
    }

    @Test
    void invalidRsvpStatusIs400() throws Exception {
        mvc.perform(post("/api/v1/public/invite/wos-abc/rsvp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rsvpStatus\":\"MAYBE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid request parameters."));
        verifyNoInteractions(invitationService);
    }

    @Test
    void malformedJsonIs400() throws Exception {
        mvc.perform(post("/api/v1/tasks").param("weddingId", "5")
                        .contentType(MediaType.APPLICATION_JSON).content("{not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed or invalid request body."));
    }

    // ---- Unexpected errors never leak details -----------------------------------------------

    @Test
    void unexpectedErrorReturnsGeneric500WithoutInternals() throws Exception {
        when(taskService.getTasks(eq(5L), any(), any()))
                .thenThrow(new RuntimeException("jdbc:mysql://internal-db-host:3306 password=s3cr3t"));

        mvc.perform(get("/api/v1/tasks").param("weddingId", "5"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An unexpected error occurred."))
                .andExpect(content().string(not(containsString("internal-db-host"))))
                .andExpect(content().string(not(containsString("s3cr3t"))))
                .andExpect(content().string(not(containsString("RuntimeException"))))
                .andExpect(jsonPath("$.trace").doesNotExist());
    }
}
